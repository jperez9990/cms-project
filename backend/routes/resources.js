const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|mp4|mp3|doc|docx|xls|xlsx/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.findAll({ order: [['createdAt', 'DESC']] });
    res.json(resources);
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/upload', authMiddleware, requireRole('admin', 'editor'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;

    const resource = await Resource.create({
      nombre: req.file.filename,
      nombre_original: req.file.originalname,
      tipo: req.file.mimetype,
      url,
      tamaño: req.file.size,
      subido_por: req.user.id,
    });
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });

    const filePath = `${process.env.UPLOAD_PATH || 'uploads/'}${resource.nombre}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await resource.destroy();
    res.json({ message: 'Recurso eliminado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
