const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/update/:id', upload.single('imagem'), userController.updateImage);
router.put('/update-data/:id', userController.updateData);

module.exports = router;