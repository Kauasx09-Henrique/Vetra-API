const pool = require('../config/db');

// --- FUNÇÃO DE SEGURANÇA: GARANTE QUE A TABELA EXISTE ---
const garantirTabela = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS espacos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            preco_por_hora NUMERIC(10, 2) NOT NULL, -- Numeric guarda dinheiro corretamente
            ativo BOOLEAN DEFAULT TRUE,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(query);
};

// --- LISTAR (CORRIGIDO PARA RETORNAR NÚMEROS) ---
const listarEspacos = async (req, res) => {
    try {
        await garantirTabela(); // Garante que a tabela existe antes de buscar

        // O segredo: CAST(preco_por_hora AS FLOAT)
        // Isso força o banco a mandar um Número (150.50) e não Texto ("150.50")
        const query = `
            SELECT 
                id, 
                nome, 
                descricao, 
                CAST(preco_por_hora AS FLOAT) as preco_por_hora, 
                ativo 
            FROM espacos 
            WHERE ativo = TRUE
            ORDER BY id ASC
        `;
        
        const spaces = await pool.query(query);
        
        console.log("Espaços encontrados:", spaces.rows); // Veja no terminal do VSCode se apareceu
        res.json(spaces.rows);
    } catch (err) {
        console.error("Erro no Backend:", err.message);
        res.status(500).json({ msg: "Erro ao buscar dados: " + err.message });
    }
};

// --- CRIAR ---
const criarEspaco = async (req, res) => {
    // Validação de Admin (Seu middleware deve popular req.user)
    if (!req.user || req.user.tipo !== 'ADMIN') {
        return res.status(403).json({ msg: 'Apenas admins podem criar espaços' });
    }

    const { nome, descricao, preco_por_hora } = req.body;

    try {
        await garantirTabela(); // Garante tabela

        const newSpace = await pool.query(
            'INSERT INTO espacos (nome, descricao, preco_por_hora) VALUES ($1, $2, $3) RETURNING *',
            [nome, descricao, preco_por_hora]
        );
        
        // Converte o preço do item criado também para evitar erro no frontend imediato
        const criado = newSpace.rows[0];
        criado.preco_por_hora = parseFloat(criado.preco_por_hora);

        res.status(201).json(criado);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// --- ATUALIZAR ---
const atualizarEspaco = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    const { id } = req.params;
    const { nome, descricao, preco_por_hora, ativo } = req.body;

    try {
        await pool.query(
            'UPDATE espacos SET nome=$1, descricao=$2, preco_por_hora=$3, ativo=$4 WHERE id=$5',
            [nome, descricao, preco_por_hora, ativo, id]
        );
        res.json({ msg: 'Espaço atualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// --- DELETAR ---
const deletarEspaco = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM espacos WHERE id = $1', [id]);
        res.json({ msg: 'Espaço removido' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

module.exports = { criarEspaco, listarEspacos, atualizarEspaco, deletarEspaco };