const pool = require('../config/db');

const criarEspaco = async (req, res) => {
    if (req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Apenas admins podem criar espaços' });

    const { nome, descricao, preco_por_hora } = req.body;
    try {
        const newSpace = await pool.query(
            'INSERT INTO espacos (nome, descricao, preco_por_hora) VALUES ($1, $2, $3) RETURNING *',
            [nome, descricao, preco_por_hora]
        );
        res.status(201).json(newSpace.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const listarEspacos = async (req, res) => {
    try {
        const spaces = await pool.query('SELECT * FROM espacos WHERE ativo = TRUE');
        res.json(spaces.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const atualizarEspaco = async (req, res) => {
    if (req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    const { id } = req.params;
    const { nome, descricao, preco_por_hora, ativo } = req.body;

    try {
        await pool.query(
            'UPDATE espacos SET nome=$1, descricao=$2, preco_por_hora=$3, ativo=$4 WHERE id=$5',
            [nome, descricao, preco_por_hora, ativo, id]
        );
        res.json({ msg: 'Espaço atualizado' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const deletarEspaco = async (req, res) => {
    if (req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM espacos WHERE id = $1', [id]);
        res.json({ msg: 'Espaço removido' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = { criarEspaco, listarEspacos, atualizarEspaco, deletarEspaco };