const express = require('express');
const Page = require('../models/Page');
const User = require('../models/User');
const router = express.Router();

router.get('/pages', async (req, res) => {
  try {
    const pages = await Page.findAll({
      where: { estado: 'publicado' },
      include: [{ model: User, as: 'autor', attributes: ['id', 'nombre'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(pages);
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
