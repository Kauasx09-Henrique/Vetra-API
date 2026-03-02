const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ msg: 'Acesso negado. Token não fornecido.' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // Se o erro for especificamente de expiração de tempo
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Sessão expirada por tempo.' });
        }
        // Para qualquer outro erro de token malformado
        res.status(400).json({ msg: 'Token inválido' });
    }
};