const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const notificacaoController = require('../controllers/notificacaoController');

router.get('/', auth, notificacaoController.listarNotificacoes);

router.put('/:id/ler', auth, notificacaoController.marcarComoLida);

module.exports = router;