const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''))
    }
});

const upload = multer({ storage: storage });

router.post('/', auth, upload.single('comprovante'), agendamentoController.criarAgendamento);
router.get('/', auth, agendamentoController.listarAgendamentos);
router.get('/disponibilidade', agendamentoController.verificarDisponibilidade);
router.put('/:id/status', auth, agendamentoController.atualizarStatusAgendamento);
router.put('/:id/cancelar', auth, agendamentoController.gerenciarCancelamento);
router.post('/bloquear', auth, agendamentoController.bloquearHorario);

module.exports = router;