const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Page = sequelize.define('Page', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  contenido: { type: DataTypes.TEXT('long'), allowNull: true },
  estado: {
    type: DataTypes.ENUM('borrador', 'publicado', 'archivado'),
    defaultValue: 'borrador',
  },
  autor_id: { type: DataTypes.INTEGER, allowNull: false },
  descripcion: { type: DataTypes.STRING(500), allowNull: true },
  url_externa: { type: DataTypes.STRING(500), allowNull: true },
}, { tableName: 'pages', timestamps: true });

module.exports = Page;
