const pool = require('../config/db');

// --- SISTEMA DE VERIFICAÇÃO DE CONTATO ---

const enviarCodigoVerificacao = async (req, res) => {
    const { telefone } = req.body; // Telefone chega limpo (sem máscara) do frontend
    const usuario_id = req.user.id;
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await pool.query(
            'UPDATE usuarios SET telefone = $1, codigo_verificacao = $2, telefone_verificado = FALSE WHERE id = $3',
            [telefone, codigo, usuario_id]
        );

        // Simulador de envio (Verificar logs no dashboard da Render)
        console.log(`\n--- VETRA STUDIO: CÓDIGO DE ACESSO ---`);
        console.log(`DESTINATÁRIO: ${telefone}`);
        console.log(`CÓDIGO: ${codigo}`);
        console.log(`--------------------------------------\n`);

        res.json({ msg: 'Código enviado com sucesso! Confira o console do servidor.' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao gerar código de segurança.' });
    }
};

const validarCodigoTelefone = async (req, res) => {
    const { codigo } = req.body;
    const usuario_id = req.user.id;

    try {
        const result = await pool.query(
            'SELECT codigo_verificacao FROM usuarios WHERE id = $1',
            [usuario_id]
        );

        if (result.rows[0]?.codigo_verificacao === codigo) {
            // Limpa o código após o uso e marca como verificado
            await pool.query(
                'UPDATE usuarios SET telefone_verificado = TRUE, codigo_verificacao = NULL WHERE id = $1',
                [usuario_id]
            );
            res.json({ msg: 'Sucesso! Telefone validado corretamente.' });
        } else {
            res.status(400).json({ msg: 'Código incorreto ou expirado.' });
        }
    } catch (err) {
        res.status(500).json({ msg: 'Erro interno na validação.' });
    }
};

// --- GESTÃO ADMINISTRATIVA DE USUÁRIOS ---

const listarUsuarios = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });

    try {
        const result = await pool.query(
            'SELECT id, nome, email, telefone, telefone_verificado, tipo, ativo, criado_em FROM usuarios ORDER BY id ASC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const atualizarStatusUsuario = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });

    const { id } = req.params;
    const { ativo } = req.body;

    try {
        await pool.query('UPDATE usuarios SET ativo = $1 WHERE id = $2', [ativo, id]);
        res.json({ msg: 'Status do usuário atualizado' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const alterarTipoUsuario = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });

    const { id } = req.params;
    const { tipo } = req.body;

    try {
        await pool.query('UPDATE usuarios SET tipo = $1 WHERE id = $2', [tipo, id]);
        res.json({ msg: 'Nível de acesso atualizado' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deletarUsuario = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });

    const { id } = req.params;

    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ msg: 'Usuário removido com sucesso' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    listarUsuarios,
    atualizarStatusUsuario,
    alterarTipoUsuario,
    deletarUsuario,
    enviarCodigoVerificacao,
    validarCodigoTelefone
};