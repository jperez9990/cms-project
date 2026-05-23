const express = require('express');
const Page = require('../models/Page');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

const makeSlug = (titulo) =>
  titulo.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const where = {
      [Op.or]: [
        { estado: 'publicado' },
        { autor_id: req.user.id },
        ...(req.user.rol === 'admin' ? [{}] : []),
      ],
    };
    const pages = await Page.findAll({
      where: req.user.rol === 'admin' ? {} : where,
      include: [{ model: User, as: 'autor', attributes: ['id', 'nombre'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id, {
      include: [{ model: User, as: 'autor', attributes: ['id', 'nombre'] }],
    });
    if (!page) return res.status(404).json({ error: 'Página no encontrada' });
    if (page.estado !== 'publicado' && page.autor_id !== req.user.id && req.user.rol !== 'admin')
      return res.status(403).json({ error: 'No tienes acceso a esta página' });
    res.json(page);
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, contenido, estado, descripcion, url_externa } = req.body;
    if (!titulo) return res.status(400).json({ error: 'El título es requerido' });

    let slug = makeSlug(titulo);
    const exists = await Page.findOne({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now()}`;

    const page = await Page.create({
      titulo, contenido,
      estado: estado || 'borrador',
      slug, autor_id: req.user.id, descripcion, url_externa,
    });
    res.status(201).json(page);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Página no encontrada' });

    if (req.user.rol !== 'admin' && page.autor_id !== req.user.id)
      return res.status(403).json({ error: 'Solo puedes editar tus propias páginas' });

    if (req.body.titulo && req.body.titulo !== page.titulo) {
      let slug = makeSlug(req.body.titulo);
      const exists = await Page.findOne({ where: { slug } });
      if (exists && exists.id !== page.id) slug = `${slug}-${Date.now()}`;
      req.body.slug = slug;
    }

    await page.update(req.body);
    res.json(page);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Página no encontrada' });

    if (req.user.rol !== 'admin' && page.autor_id !== req.user.id)
      return res.status(403).json({ error: 'Solo puedes eliminar tus propias páginas' });

    await page.destroy();
    res.json({ message: 'Página eliminada correctamente' });
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
