const pool = require('../config/db');

const listarUsuarios = async (req, res) => {
    if (req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    
    try {
        const result = await pool.query('SELECT id, nome, email, tipo, ativo, criado_em FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const atualizarStatusUsuario = async (req, res) => {
    if (req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    
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
    if (req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    
    const { id } = req.params;
    const { tipo } = req.body;
    
    try {
        await pool.query('UPDATE usuarios SET tipo = $1 WHERE id = $2', [tipo, id]);
        res.json({ msg: 'Tipo de usuário atualizado' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = { listarUsuarios, atualizarStatusUsuario, alterarTipoUsuario };