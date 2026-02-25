const pool = require('../config/db');

const garantirColunas = async () => {
    try {
        await pool.query('ALTER TABLE usuarios ADD COLUMN ativo BOOLEAN DEFAULT TRUE;');
    } catch (e) {
        if (e.code !== '42701') {
            console.error(e.message);
        }
    }
};

const listarUsuarios = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    
    try {
        await garantirColunas();
        const result = await pool.query('SELECT id, nome, email, tipo, ativo, criado_em FROM usuarios ORDER BY id ASC');
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

module.exports = { listarUsuarios, atualizarStatusUsuario, alterarTipoUsuario, deletarUsuario };