const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Necessário para gerar senha aleatória

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

// --- NOVA FUNÇÃO DE LOGIN GOOGLE ---
const googleLogin = async (req, res) => {
    const { email, nome, googleId, foto } = req.body;

    try {
        // 1. Verifica se o usuário já existe pelo email
        let userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
            // === CENÁRIO 1: USUÁRIO NOVO ===
            // Como sua tabela exige senha_hash, geramos uma senha aleatória segura
            // O usuário não saberá essa senha (ele entra pelo Google), o que é seguro.
            const senhaAleatoria = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senhaAleatoria, salt);

            // Insere salvando google_id e foto
            const newUser = await pool.query(
                `INSERT INTO usuarios (nome, email, senha_hash, tipo, google_id, foto) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [nome, email, senhaHash, 'CLIENTE', googleId, foto]
            );
            user = newUser.rows[0];
        } else {
            // === CENÁRIO 2: USUÁRIO JÁ EXISTE ===
            // Se ele já tinha conta normal e agora entrou pelo Google, vinculamos a conta
            if (!user.google_id) {
                const updatedUser = await pool.query(
                    'UPDATE usuarios SET google_id = $1, foto = $2 WHERE email = $3 RETURNING *',
                    [googleId, foto, email]
                );
                user = updatedUser.rows[0];
            }
        }

        // 3. Gera o Token JWT para o Frontend
        const token = jwt.sign(
            { id: user.id, tipo: user.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo,
                foto: user.foto // Agora mandamos a foto pro front também!
            }
        });

    } catch (err) {
        console.error("Erro Google Login:", err);
        res.status(500).send('Erro no servidor ao processar Google Login');
    }
};

module.exports = { register, login, googleLogin };