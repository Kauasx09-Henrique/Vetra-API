const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, userController.listarUsuarios);
router.put('/:id/status', auth, userController.atualizarStatusUsuario);
router.put('/:id/tipo', auth, userController.alterarTipoUsuario);
router.delete('/:id', auth, userController.deletarUsuario);

module.exports = router;