const pool = require('../config/db');

const listarNotificacoes = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const query = `
            SELECT * FROM notificacoes 
            WHERE usuario_id = $1 
            ORDER BY lida ASC, criado_em DESC 
            LIMIT 10
        `;
        const result = await pool.query(query, [usuarioId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar notificações');
    }
};

const marcarComoLida = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.user.id;

        await pool.query(
            'UPDATE notificacoes SET lida = TRUE WHERE id = $1 AND usuario_id = $2',
            [id, usuarioId]
        );
        res.json({ msg: 'Lida' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao marcar como lida');
    }
};

module.exports = { listarNotificacoes, marcarComoLida };