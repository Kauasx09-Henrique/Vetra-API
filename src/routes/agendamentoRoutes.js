const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    criarAgendamento,
    listarAgendamentos,
    verificarDisponibilidade,
    atualizarStatus,
    gerenciarCancelamento
} = require('../controllers/agendamentoController');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


router.get('/disponibilidade', auth, verificarDisponibilidade);

router.patch('/:id/gerenciar', auth, gerenciarCancelamento);

router.put('/:id', auth, atualizarStatus);

router.get('/', auth, listarAgendamentos);
router.post('/', auth, upload.single('comprovante'), criarAgendamento);

module.exports = router;