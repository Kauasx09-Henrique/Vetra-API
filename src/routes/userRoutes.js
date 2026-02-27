const express = require('express');
const router = express.Router();
const userController = require('../controllers/usuarioController'); // Certifique-se de que o nome do arquivo está correto
const auth = require('../middleware/authMiddleware');

// --- ROTAS DE GESTÃO (Acesso Admin) ---

// Lista todos os usuários (Admin visualiza telefone e status de verificação)
router.get('/', auth, userController.listarUsuarios);

// Ativa ou desativa um usuário
router.put('/:id/status', auth, userController.atualizarStatusUsuario);

// Altera o nível de acesso (USER para ADMIN)
router.put('/:id/tipo', auth, userController.alterarTipoUsuario);

// Remove um usuário do sistema
router.delete('/:id', auth, userController.deletarUsuario);


// --- ROTAS DE VERIFICAÇÃO DE TELEFONE (Acesso Usuário Logado) ---

/**
 * Rota para enviar o código de 6 dígitos via SMS/WhatsApp
 * O usuário deve enviar o número de telefone no corpo da requisição
 */
router.post('/enviar-codigo', auth, userController.enviarCodigoVerificacao);

/**
 * Rota para validar o código recebido pelo usuário
 * Se o código bater com o do banco, o status 'telefone_verificado' muda para TRUE
 */
router.post('/validar-codigo', auth, userController.validarCodigoTelefone);

module.exports = router;