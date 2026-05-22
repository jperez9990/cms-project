require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');

const User = require('./models/User');
const Page = require('./models/Page');
const Resource = require('./models/Resource');
const SiteConfig = require('./models/SiteConfig');

Page.belongsTo(User, { as: 'autor', foreignKey: 'autor_id' });
User.hasMany(Page, { as: 'paginas', foreignKey: 'autor_id' });

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/config', require('./routes/config'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');

    const adminExists = await User.findOne({ where: { rol: 'admin' } });
    if (!adminExists) {
      await User.create({
        nombre: 'Administrador',
        email: process.env.ADMIN_EMAIL || 'admin@cms.com',
        password: process.env.ADMIN_PASSWORD || 'Admin1234!',
        rol: 'admin',
      });
      console.log('✅ Usuario admin creado: admin@cms.com / Admin1234!');
    }

    const configExists = await SiteConfig.findOne({ where: { clave: 'site_name' } });
    if (!configExists) {
      await SiteConfig.bulkCreate([
        { clave: 'site_name', valor: 'Mi CMS' },
        { clave: 'site_description', valor: 'Sistema de Gestión de Contenidos' },
        { clave: 'site_color', valor: '#1F497D' },
      ]);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
};

start();
