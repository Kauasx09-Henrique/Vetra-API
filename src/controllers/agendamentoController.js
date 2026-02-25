const pool = require('../config/db');
const { criarNotificacao } = require('./notificacaoController');
const { enviarEmailStatus } = require('../config/emailService');

const criarAgendamento = async (req, res) => {
    const { espaco_id, data_inicio, data_fim, metodo_pagamento } = req.body;
    const usuario_id = req.user.id;
    const comprovante_url = req.file ? req.file.path.replace(/\\/g, "/") : null;

    try {
        const conflito = await pool.query(
            `SELECT * FROM agendamentos 
             WHERE espaco_id = $1 
             AND status != 'CANCELADO'
             AND (data_inicio < $3 AND data_fim > $2)`,
            [espaco_id, data_inicio, data_fim]
        );

        if (conflito.rows.length > 0) {
            return res.status(400).json({ msg: 'Horário indisponível para este espaço.' });
        }

        const espaco = await pool.query('SELECT preco_por_hora FROM espacos WHERE id = $1', [espaco_id]);

        if (espaco.rows.length === 0) {
            return res.status(404).json({ msg: 'Espaço não encontrado' });
        }

        const precoHora = parseFloat(espaco.rows[0].preco_por_hora);
        const inicio = new Date(data_inicio);
        const fim = new Date(data_fim);

        const horas = Math.abs(fim - inicio) / 36e5;
        const preco_total = horas * precoHora;

        const newBooking = await pool.query(
            `INSERT INTO agendamentos 
            (usuario_id, espaco_id, data_inicio, data_fim, preco_total, metodo_pagamento, comprovante_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [usuario_id, espaco_id, data_inicio, data_fim, preco_total, metodo_pagamento, comprovante_url]
        );

        res.status(201).json(newBooking.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor ao criar agendamento');
    }
};

const listarAgendamentos = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const tipoUsuario = req.user.tipo;

        let query = "";
        let params = [];

        if (tipoUsuario === 'ADMIN') {
            query = `
                SELECT 
                    a.id, a.data_inicio, a.data_fim, a.status, a.metodo_pagamento, 
                    a.preco_total::FLOAT as preco_total, a.comprovante as comprovante_url,
                    u.nome as usuario_nome, u.email as usuario_email,
                    e.nome as espaco_nome,
                    e.imagem_url as espaco_imagem_url
                FROM agendamentos a
                JOIN usuarios u ON a.usuario_id = u.id
                JOIN espacos e ON a.espaco_id = e.id
                ORDER BY a.data_inicio DESC
            `;
        } else {
            query = `
                SELECT 
                    a.id, a.data_inicio, a.data_fim, a.status, a.metodo_pagamento, a.preco_total::FLOAT as preco_total,
                    e.nome as espaco_nome,
                    e.imagem_url as espaco_imagem_url
                FROM agendamentos a
                JOIN espacos e ON a.espaco_id = e.id
                WHERE a.usuario_id = $1
                ORDER BY a.data_inicio DESC
            `;
            params = [usuarioId];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar agendamentos');
    }
};

const verificarDisponibilidade = async (req, res) => {
    const { espaco_id, data } = req.query;

    try {
        const query = `
            SELECT data_inicio, data_fim 
            FROM agendamentos 
            WHERE espaco_id = $1 
            AND status != 'CANCELADO'
            AND Date(data_inicio) = $2
        `;

        const result = await pool.query(query, [espaco_id, data]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao verificar disponibilidade' });
    }
};

const atualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(
            'UPDATE agendamentos SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Agendamento não encontrado' });
        }

        const agendamento = result.rows[0];

        const userResult = await pool.query('SELECT nome, email FROM usuarios WHERE id = $1', [agendamento.usuario_id]);
        const cliente = userResult.rows[0];
        const dataFormatada = new Date(agendamento.data_inicio).toLocaleDateString('pt-BR');

        if (status === 'CONFIRMADO') {
            await criarNotificacao(agendamento.usuario_id, `Sua reserva para o dia ${dataFormatada} foi CONFIRMADA!`);
            if (cliente) await enviarEmailStatus(cliente.email, cliente.nome, status, dataFormatada, id);
        } else if (status === 'CANCELADO') {
            await criarNotificacao(agendamento.usuario_id, `Sua reserva #${id} foi CANCELADA.`);
            if (cliente) await enviarEmailStatus(cliente.email, cliente.nome, status, dataFormatada, id);
        }

        res.json(agendamento);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar status');
    }
};

const gerenciarCancelamento = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const { acao } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM agendamentos WHERE id = $1 AND usuario_id = $2',
            [id, usuario_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Agendamento não encontrado.' });
        }

        const agendamento = result.rows[0];
        const hoje = new Date();
        const dataAgendamento = new Date(agendamento.data_inicio);

        const diferencaTempo = dataAgendamento.getTime() - hoje.getTime();
        const diasRestantes = Math.ceil(diferencaTempo / (1000 * 3600 * 24));

        let novoStatus = '';

        if (agendamento.metodo_pagamento !== 'PIX' && acao === 'CANCELAR') {
            novoStatus = 'CANCELADO';
        }
        else if (agendamento.metodo_pagamento === 'PIX' && acao === 'REAGENDAR') {
            if (diasRestantes < 3) {
                return res.status(400).json({ msg: 'Reagendamento via PIX requer 3 dias de antecedência.' });
            }
            novoStatus = 'REAGENDAMENTO_SOLICITADO';
        }
        else {
            return res.status(400).json({ msg: 'Ação inválida para este tipo de pagamento.' });
        }

        await pool.query(
            'UPDATE agendamentos SET status = $1 WHERE id = $2',
            [novoStatus, id]
        );

        res.json({ msg: 'Solicitação realizada com sucesso!', status: novoStatus });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao processar solicitação.');
    }
};

const atualizarStatusAgendamento = async (req, res) => {
    if (req.user.tipo !== 'ADMIN') {
        return res.status(403).json({ msg: 'Apenas admins podem alterar status.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    try {
        const updateQuery = `
            UPDATE agendamentos 
            SET status = $1 
            WHERE id = $2 
            RETURNING usuario_id, data_inicio, espaco_id
        `;
        const result = await pool.query(updateQuery, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Agendamento não encontrado.' });
        }

        const agendamento = result.rows[0];

        const userResult = await pool.query('SELECT nome, email FROM usuarios WHERE id = $1', [agendamento.usuario_id]);
        const cliente = userResult.rows[0];
        const dataFormatada = new Date(agendamento.data_inicio).toLocaleDateString('pt-BR');

        if (status === 'CONFIRMADO') {
            await criarNotificacao(agendamento.usuario_id, `Seu agendamento para o dia ${dataFormatada} foi CONFIRMADO!`);
            if (cliente) await enviarEmailStatus(cliente.email, cliente.nome, status, dataFormatada, id);
        }

        if (status === 'CANCELADO') {
            await criarNotificacao(agendamento.usuario_id, `Seu agendamento #${id} foi cancelado. Entre em contato.`);
            if (cliente) await enviarEmailStatus(cliente.email, cliente.nome, status, dataFormatada, id);
        }

        res.json({ msg: `Status atualizado para ${status}` });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar status');
    }
};

const bloquearHorario = async (req, res) => {
    if (req.user.tipo !== 'ADMIN') {
        return res.status(403).json({ msg: 'Apenas admins podem bloquear horários.' });
    }

    const { espaco_id, data_inicio, data_fim, motivo } = req.body;
    const usuario_id = req.user.id; 

    try {
        const conflito = await pool.query(
            `SELECT * FROM agendamentos 
             WHERE espaco_id = $1 
             AND status != 'CANCELADO'
             AND (data_inicio < $3 AND data_fim > $2)`,
            [espaco_id, data_inicio, data_fim]
        );

        if (conflito.rows.length > 0) {
            return res.status(400).json({ msg: 'Horário já possui uma reserva ou bloqueio.' });
        }

        const newBlock = await pool.query(
            `INSERT INTO agendamentos 
            (usuario_id, espaco_id, data_inicio, data_fim, preco_total, metodo_pagamento, status) 
            VALUES ($1, $2, $3, $4, 0, $5, 'BLOQUEADO') RETURNING *`,
            [usuario_id, espaco_id, data_inicio, data_fim, motivo || 'BLOQUEIO_ADMIN']
        );

        res.status(201).json(newBlock.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor ao bloquear horário');
    }
};

module.exports = {
    criarAgendamento,
    listarAgendamentos,
    verificarDisponibilidade,
    atualizarStatus,
    gerenciarCancelamento,
    atualizarStatusAgendamento,
    bloquearHorario
};