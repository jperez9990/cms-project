const express = require('express');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });

    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

    const user = await User.create({ nombre, email, password, rol: rol || 'lector' });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json(userData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Solo admin puede editar otros usuarios o cambiar roles
    if (req.user.rol !== 'admin' && req.user.id !== user.id)
      return res.status(403).json({ error: 'No tienes permisos para editar este usuario' });

    const { nombre, email, password, rol, activo } = req.body;
    const updateData = { nombre, email };

    // Solo admin puede cambiar rol y estado
    if (req.user.rol === 'admin') {
      if (rol) updateData.rol = rol;
      if (activo !== undefined) updateData.activo = activo;
    }

    if (password) updateData.password = password;

    await user.update(updateData);
    const { password: _, ...userData } = user.toJSON();
    res.json(userData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id == req.user.id)
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
