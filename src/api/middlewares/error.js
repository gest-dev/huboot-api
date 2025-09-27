/* eslint-disable no-unused-vars */
import APIError from '../../api/errors/api.error.js';

const handler = (err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500;

    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode).json({
        error: true,
        code: statusCode,
        message: err.message,
    });
};

const notFound = (req, res, next) => {
    const monolitoEjs = req.headers.accept?.includes('text/html') ?? false;

    if (monolitoEjs) {
        // se a rota for raiz / então deve ir para /manager
        if (req.url === '/') {
            return res.redirect('/manager');
        } else {
            req.flash('error', 'Página não encontrada.');
            return res.status(404).render('not-found'); // Certifique-se de criar a view not-found.ejs
        }
    } else {
        const err = new APIError({
            message: 'Not found',
            errors: ['The requested resource could not be found'],
            status: 404,
        });
        return handler(err, req, res);
    }
};

export default {
    handler,
    notFound,
};