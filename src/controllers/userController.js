const pool = require('../config/db');


const salvarTelefone = async (req, res) => {
    const { telefone } = req.body; // Chega limpo do front: "61988887777"
    const usuario_id = req.user.id;

    if (!telefone || telefone.length < 10) {
        return res.status(400).json({ msg: 'Por favor, informe um telefone válido.' });
    }

    try {
        await pool.query(
            'UPDATE usuarios SET telefone = $1, telefone_verificado = TRUE WHERE id = $2',
            [telefone, usuario_id]
        );

        res.json({ msg: 'Telefone salvo com sucesso!' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao salvar o contato.' });
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
        const result = await pool.query('SELECT id, nome, email, telefone, tipo, ativo, criado_em FROM usuarios ORDER BY id ASC');
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
    salvarTelefone,
    validarCodigoTelefone
};