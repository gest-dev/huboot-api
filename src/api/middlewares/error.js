/* eslint-disable no-unused-vars */
const APIError = require('../../api/errors/api.error')

const handler = (err, req, res, next) => {

    const statusCode = (err.status || err.statusCode ? (err.status ? err.status : err.statusCode) : 500);

    res.setHeader('Content-Type', 'application/json')
    res.status(statusCode)
    res.json({
        error: true,
        code: statusCode,
        message: err.message,
    })
}

exports.handler = handler

exports.notFound = (req, res, next) => {
    let monolitoEjs = (req.headers.accept && req.headers.accept.includes('text/html')) ? true : false;
    if (monolitoEjs) {
        // se a rota for raiz / então deve ir para  /manager
        if (req.url === '/') {
            return res.redirect('/manager');
        } else {
            req.flash('error', 'Página não encontrada.');
            res.status(404)
                .render('not-found'); // Certifique-se de criar a view 404.ejs
        }

    } else {
        const err = new APIError({
            message: 'Not found',
            errors: ['The requested resource could not be found'],
            status: 404,
        })
        return handler(err, req, res)
    }
}
