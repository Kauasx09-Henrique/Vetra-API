const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// --- CONFIGURAÇÃO DO EMAIL ---
// Certifique-se de ter EMAIL_USER e EMAIL_PASS no seu arquivo .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Senha de App do Google
    }
});

// --- CADASTRO ---
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

// --- LOGIN NORMAL ---
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

// --- LOGIN GOOGLE ---
const googleLogin = async (req, res) => {
    const { email, nome, googleId, foto } = req.body;

    try {
        let userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
            // Usuário novo via Google
            const senhaAleatoria = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senhaAleatoria, salt);

            const newUser = await pool.query(
                `INSERT INTO usuarios (nome, email, senha_hash, tipo, google_id, foto) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [nome, email, senhaHash, 'CLIENTE', googleId, foto]
            );
            user = newUser.rows[0];
        } else {
            // Usuário existe, vincula Google se não tiver
            if (!user.google_id) {
                const updatedUser = await pool.query(
                    'UPDATE usuarios SET google_id = $1, foto = $2 WHERE email = $3 RETURNING *',
                    [googleId, foto, email]
                );
                user = updatedUser.rows[0];
            }
        }

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
                foto: user.foto
            }
        });

    } catch (err) {
        console.error("Erro Google Login:", err);
        res.status(500).send('Erro no servidor ao processar Google Login');
    }
};

// --- ESQUECEU A SENHA (COM HTML ESTILIZADO) ---
const esqueceuSenha = async (req, res) => {
    const { email } = req.body;

    try {
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        const usuario = userCheck.rows[0];
        const token = crypto.randomBytes(20).toString('hex');

        // Expira em 1 hora
        const agora = new Date();
        agora.setHours(agora.getHours() + 1);

        await pool.query(
            'UPDATE usuarios SET reset_token = $1, reset_expires = $2 WHERE id = $3',
            [token, agora, usuario.id]
        );

        // ATENÇÃO: Verifique se sua porta do frontend é 5173 ou 3000 e ajuste abaixo:
        const linkFront = `http://localhost:5173/redefinir-senha?token=${token}`;

        // Template HTML Vetra (Dourado e Preto)
        const htmlTemplate = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                
                <div style="background-color: #1a1a1a; padding: 35px; text-align: center;">
                    <h1 style="color: #C0A062; margin: 0; font-family: 'Times New Roman', serif; letter-spacing: 3px; font-size: 28px;">VETRA</h1>
                </div>

                <div style="padding: 40px; color: #333333; line-height: 1.6;">
                    <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">Redefinição de Senha</h2>
                    <p style="font-size: 16px;">Olá, <strong>${usuario.nome.split(' ')[0]}</strong>.</p>
                    <p style="font-size: 16px; color: #555;">Recebemos uma solicitação para redefinir a senha da sua conta Vetra. Se foi você, clique no botão abaixo para criar uma nova senha:</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${linkFront}" style="background-color: #C0A062; color: #1a1a1a; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 16px; transition: background 0.3s;">
                            REDEFINIR MINHA SENHA
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Se o botão não funcionar, copie o link abaixo:</p>
                    <p style="font-size: 12px; color: #999; word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 4px;">${linkFront}</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="font-size: 13px; color: #888;">
                        <strong>Atenção:</strong> Este link expira em 1 hora.<br>
                        Se você não solicitou, ignore este e-mail.
                    </p>
                </div>

                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee;">
                    &copy; ${new Date().getFullYear()} Estúdio Vetra. Todos os direitos reservados.
                </div>
            </div>
        </div>
        `;

        const mailOptions = {
            from: `"Equipe Vetra" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recuperação de Senha - Vetra',
            html: htmlTemplate
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: 'E-mail enviado com sucesso!' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao enviar e-mail de recuperação.');
    }
};

// --- REDEFINIR SENHA (SALVAR NO BANCO) ---
const redefinirSenha = async (req, res) => {
    const { token, novaSenha } = req.body;

    try {
        // Verifica token e validade
        const query = `
            SELECT * FROM usuarios 
            WHERE reset_token = $1 
            AND reset_expires > NOW()
        `;

        const result = await pool.query(query, [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ msg: 'Token inválido ou expirado.' });
        }

        const usuario = result.rows[0];

        // Criptografa nova senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        // Atualiza e limpa token
        await pool.query(
            'UPDATE usuarios SET senha_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
            [senhaHash, usuario.id]
        );

        res.json({ msg: 'Senha alterada com sucesso!' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao redefinir senha.');
    }
};

// MUDAR STATUS DO USUÁRIO (EX: BLOQUEAR/ATIVAR) - OPÇÃO PARA FUTURAS IMPLEMENTAÇÕES



module.exports = {
    register,
    login,
    googleLogin,
    esqueceuSenha,
    redefinirSenha
};