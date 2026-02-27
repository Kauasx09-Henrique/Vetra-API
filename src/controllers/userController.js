const pool = require('../config/db');

/**
 * Função para garantir que a tabela tenha as colunas necessárias para 
 * a nova lógica de verificação de telefone.
 */
const garantirColunas = async () => {
    try {
        // Coluna de status do usuário
        await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;');

        // Colunas para telefone e verificação
        await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);');
        await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone_verificado BOOLEAN DEFAULT FALSE;');
        await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_verificacao VARCHAR(6);');
    } catch (e) {
        console.error("Erro ao atualizar esquema de usuários:", e.message);
    }
};

/**
 * Gera e envia um código de 6 dígitos para o telefone informado.
 * Atualiza o registro do usuário com o código temporário.
 */
const enviarCodigoVerificacao = async (req, res) => {
    const { telefone } = req.body;
    const usuario_id = req.user.id;

    // Gera um código aleatório de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await pool.query(
            'UPDATE usuarios SET telefone = $1, codigo_verificacao = $2, telefone_verificado = FALSE WHERE id = $3',
            [telefone, codigo, usuario_id]
        );

        // Simulando o envio de SMS (Integre aqui com Twilio, Zenvia ou API de WhatsApp)
        console.log(`[SMS VETRA] Enviando código ${codigo} para o número ${telefone}`);

        res.json({ msg: 'Código de verificação enviado com sucesso!' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao processar solicitação de verificação.' });
    }
};

/**
 * Compara o código enviado pelo usuário com o salvo no banco.
 * Se correto, marca o telefone como verificado.
 */
const validarCodigoTelefone = async (req, res) => {
    const { codigo } = req.body;
    const usuario_id = req.user.id;

    try {
        const result = await pool.query(
            'SELECT codigo_verificacao FROM usuarios WHERE id = $1',
            [usuario_id]
        );

        if (!result.rows[0] || result.rows[0].codigo_verificacao !== codigo) {
            return res.status(400).json({ msg: 'Código de verificação incorreto ou expirado.' });
        }

        // Validação bem-sucedida: limpa o código e marca como verificado
        await pool.query(
            'UPDATE usuarios SET telefone_verificado = TRUE, codigo_verificacao = NULL WHERE id = $1',
            [usuario_id]
        );

        res.json({ msg: 'Telefone verificado com sucesso! Sua conta está totalmente ativa.' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao validar o código.' });
    }
};

const listarUsuarios = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') {
        return res.status(403).json({ msg: 'Acesso negado' });
    }

    try {
        await garantirColunas();
        // Adicionado campos de telefone e status de verificação na listagem do admin
        const result = await pool.query(
            `SELECT id, nome, email, telefone, telefone_verificado, tipo, ativo, criado_em 
             FROM usuarios ORDER BY id ASC`
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
        res.json({ msg: 'Tipo de usuário atualizado' });
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