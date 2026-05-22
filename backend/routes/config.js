const express = require('express');
const SiteConfig = require('../models/SiteConfig');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const configs = await SiteConfig.findAll();
    const result = {};
    configs.forEach((c) => { result[c.clave] = c.valor; });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const updates = req.body;
    for (const [clave, valor] of Object.entries(updates)) {
      await SiteConfig.upsert({ clave, valor: String(valor) });
    }
    res.json({ message: 'Configuración actualizada' });
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
