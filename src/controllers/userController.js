const pool = require('../config/db');

// Listar todos os usuários
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, nome, email, tipo, foto, google_id, criado_em 
             FROM usuarios 
             ORDER BY id DESC`
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        return res.status(500).json({ error: 'Erro interno ao buscar usuários' });
    }
};

// Excluir usuário (COM CORREÇÃO DO ERRO 400)
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verifica se o usuário existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // ==========================================================
        // AQUI ESTÁ A CORREÇÃO: Ordem de Exclusão (Cascata Manual)
        // ==========================================================

        // PASSO 1: Apagar os PAGAMENTOS vinculados aos agendamentos desse usuário
        // (Isso remove a trava da tabela 'pagamentos')
        await pool.query(`
            DELETE FROM pagamentos 
            WHERE agendamento_id IN (SELECT id FROM agendamentos WHERE usuario_id = $1)
        `, [id]);

        // PASSO 2: Apagar os AGENDAMENTOS desse usuário
        // (Agora funciona porque não tem mais pagamentos prendendo eles)
        await pool.query('DELETE FROM agendamentos WHERE usuario_id = $1', [id]);

        // PASSO 3: Finalmente, apagar o USUÁRIO
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

        return res.status(200).json({ message: 'Usuário e todos os dados vinculados foram removidos.' });

    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        return res.status(500).json({ error: 'Erro interno ao excluir usuário e seus dados.' });
    }
};

module.exports = { getAllUsers, deleteUser };