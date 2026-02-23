const express = require('express');
const router = express.Router();
const espacoController = require('../controllers/espacoController');
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

router.get('/', espacoController.listarEspacos);
router.post('/', auth, upload.single('imagem'), espacoController.criarEspaco);
router.put('/:id', auth, upload.single('imagem'), espacoController.atualizarEspaco);
router.delete('/:id', auth, espacoController.deletarEspaco);

module.exports = router;