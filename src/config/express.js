const express = require('express');
const path = require('path');
const exceptionHandler = require('express-exception-handler');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser'); // Para gerenciar cookies
const error = require('../api/middlewares/error');
const bcrypt = require('bcryptjs');

// Inicializar o app
const app = express();

// Configurar middleware global para tratar exceções
exceptionHandler.handle();

// Configurar middleware JSON e de formulários
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Configurar cookies
app.use(cookieParser());

// Configurar arquivos estáticos
app.use(express.static('src/public'));

// Configurar EJS como motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));


// Configurar sessões
app.use(
  session({
    secret: 'chave-secreta', // Substitua por uma chave segura
    resave: false,
    saveUninitialized: false,
  })
);

// Configurar connect-flash
app.use(flash());

// Middleware para disponibilizar mensagens flash globalmente nas views
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Middleware global para gerenciar instâncias do WhatsApp
global.WhatsAppInstances = {};

// Importar rotas
const routes = require('../api/routes/');
app.use('/', routes);

// Middleware para tratar erros (personalizado)
app.use(error.handler);

app.use(error.notFound);

// Exportar o app
module.exports = app;
