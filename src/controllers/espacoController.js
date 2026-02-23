const pool = require('../config/db');

const garantirTabela = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS espacos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            preco_por_hora NUMERIC(10, 2) NOT NULL,
            ativo BOOLEAN DEFAULT TRUE,
            imagem_url VARCHAR(255),
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(query);

    try {
        await pool.query(`ALTER TABLE espacos ADD COLUMN imagem_url VARCHAR(255);`);
    } catch (e) {
        if (e.code !== '42701') {
            console.error(e.message);
        }
    }
};

const listarEspacos = async (req, res) => {
    try {
        await garantirTabela();

        const query = `
            SELECT 
                id, 
                nome, 
                descricao, 
                CAST(preco_por_hora AS FLOAT) as preco_por_hora, 
                ativo,
                imagem_url
            FROM espacos 
            WHERE ativo = TRUE
            ORDER BY id ASC
        `;
        
        const spaces = await pool.query(query);
        res.json(spaces.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message });
    }
};

const criarEspaco = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') {
        return res.status(403).json({ msg: 'Acesso negado' });
    }

    const { nome, descricao, preco_por_hora } = req.body;
    const imagem_url = req.file ? req.file.path.replace(/\\/g, "/") : null;

    try {
        await garantirTabela();

        const newSpace = await pool.query(
            'INSERT INTO espacos (nome, descricao, preco_por_hora, imagem_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, descricao, preco_por_hora, imagem_url]
        );
        
        const criado = newSpace.rows[0];
        criado.preco_por_hora = parseFloat(criado.preco_por_hora);

        res.status(201).json(criado);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

const atualizarEspaco = async (req, res) => {
    if (!req.user || req.user.tipo !== 'ADMIN') return res.status(403).json({ msg: 'Acesso negado' });
    const { id } = req.params;
    const { nome, descricao, preco_por_hora, ativo } = req.body;
    const imagem_url = req.file ? req.file.path.replace(/\\/g, "/") : null;

    try {
        if (imagem_url) {
            await pool.query(
                'UPDATE espacos SET nome=$1, descricao=$2, preco_por_hora=$3, ativo=$4, imagem_url=$5 WHERE id=$6',
                [nome, descricao, preco_por_hora, ativo, imagem_url, id]
            );
        } else {
            await pool.query(
                'UPDATE espacos SET nome=$1, descricao=$2, preco_por_hora=$3, ativo=$4 WHERE id=$5',
                [nome, descricao, preco_por_hora, ativo, id]
            );
        }
        res.json({ msg: 'Espaço atualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

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