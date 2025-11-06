import express from 'express';
import path from 'path';
import exceptionHandler from 'express-exception-handler';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser'; // Para gerenciar cookies
import error from '../api/middlewares/error.js';
import bcrypt from 'bcryptjs';
import routes from '../api/routes/index.js'; // Certifique-se da extensão .js

// Inicializar o app
const app = express();

app.set('trust proxy', 1); // necessário para Cloudflare

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
app.set('views', path.join(path.resolve(), 'views'));

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
app.use('/', routes);

// Middleware para tratar erros (personalizado)
app.use(error.handler);
app.use(error.notFound);

// Exportar o app
export default app;
