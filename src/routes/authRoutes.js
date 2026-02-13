const router = require('express').Router();
const {
    register,
    login,
    googleLogin,
    esqueceuSenha,
    redefinirSenha
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// --- NOVAS ROTAS ---
router.post('/esqueceu-senha', esqueceuSenha);
router.post('/redefinir-senha', redefinirSenha);

module.exports = router;