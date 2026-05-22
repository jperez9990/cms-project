const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SiteConfig = sequelize.define('SiteConfig', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clave: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  valor: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'site_config', timestamps: false });

module.exports = SiteConfig;
