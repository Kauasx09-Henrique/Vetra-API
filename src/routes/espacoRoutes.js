const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { criarEspaco, listarEspacos, atualizarEspaco, deletarEspaco } = require('../controllers/espacoController');

router.get('/', listarEspacos);
router.post('/', auth, criarEspaco);
router.put('/:id', auth, atualizarEspaco);
router.delete('/:id', auth, deletarEspaco);

module.exports = router;