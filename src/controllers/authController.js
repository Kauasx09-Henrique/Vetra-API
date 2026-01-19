const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    try {
        const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const tipoUsuario = tipo || 'CLIENTE';

        const newUser = await pool.query(
            'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo',
            [nome, email, senhaHash, tipoUsuario]
        );

        res.status(201).json(newUser.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(400).json({ msg: 'Usuário não encontrado' });

        const validPass = await bcrypt.compare(senha, user.rows[0].senha_hash);
        if (!validPass) return res.status(400).json({ msg: 'Senha incorreta' });

        const token = jwt.sign(
            { id: user.rows[0].id, tipo: user.rows[0].tipo },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                nome: user.rows[0].nome,
                tipo: user.rows[0].tipo
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
};

module.exports = { register, login };