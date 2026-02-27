const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Rotas Administrativas (Protegidas por Token e Nível de Acesso)
router.get('/', auth, userController.listarUsuarios);
router.put('/:id/status', auth, userController.atualizarStatusUsuario);
router.put('/:id/tipo', auth, userController.alterarTipoUsuario);
router.delete('/:id', auth, userController.deletarUsuario);

// Rotas de Verificação de Telefone (Abertas para qualquer usuário logado)
router.post('/enviar-codigo', auth, userController.enviarCodigoVerificacao);
router.post('/validar-codigo', auth, userController.validarCodigoTelefone);

module.exports = router;