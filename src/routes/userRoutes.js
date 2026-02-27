const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Certifique-se de que o nome do arquivo está correto
const auth = require('../middleware/authMiddleware');


router.get('/', auth, userController.listarUsuarios);

router.put('/:id/status', auth, userController.atualizarStatusUsuario);

router.put('/:id/tipo', auth, userController.alterarTipoUsuario);

router.delete('/:id', auth, userController.deletarUsuario);


router.post('/enviar-codigo', auth, userController.enviarCodigoVerificacao);


router.post('/validar-codigo', auth, userController.validarCodigoTelefone);

module.exports = router;