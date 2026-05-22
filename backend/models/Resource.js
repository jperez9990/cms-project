const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  nombre_original: { type: DataTypes.STRING(200), allowNull: false },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  url: { type: DataTypes.STRING(500), allowNull: false },
  tamaño: { type: DataTypes.INTEGER, allowNull: true },
  subido_por: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'resources', timestamps: true });

module.exports = Resource;
