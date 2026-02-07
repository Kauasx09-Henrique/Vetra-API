const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const agendamentoController = require('../controllers/agendamentoController');

// Configuração do Multer (Upload)
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/disponibilidade', auth, agendamentoController.verificarDisponibilidade);
router.get('/', auth, agendamentoController.listarAgendamentos);
router.post('/', auth, upload.single('comprovante'), agendamentoController.criarAgendamento);
router.put('/:id', auth, agendamentoController.atualizarStatus);
router.patch('/:id/gerenciar', auth, agendamentoController.gerenciarCancelamento);

module.exports = router;