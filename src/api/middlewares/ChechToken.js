const jwt = require('jsonwebtoken')
const User = require("../models/User.model");
const InvalidToken = require('../models/InvalidToken.model')
const { isBefore, addMinutes } = require('date-fns');

// Função para verificar e atualizar lastAccessAt
async function checkAndUpdateLastAccess(user, timeLimitLogin, token) {
    // Obtenha a data atual
    const currentDate = new Date();

    // Adicione o limite de tempo de login em minutos à data atual
    const fifteenMinutesLater = addMinutes(currentDate, timeLimitLogin);

    if (user?.lastAccessAt) {
        if (isBefore(user.lastAccessAt, currentDate)) {
            // Invalidating token

            const invalid = await InvalidToken.findOne({ token: token })

            if (!invalid) {
                const blackList = new InvalidToken({
                    token: token,
                });
                blackList.save();
            }

            // Limpe lastAccessAt e lastAuthToken
            user.lastAccessAt = null;
            user.lastAuthToken = null;
            await user.save();
            throw new Error('Token inválido!');
        } else {
            user.lastAccessAt = fifteenMinutesLater;
            await user.save();
        }
    } else {
        user.lastAccessAt = fifteenMinutesLater;
        await user.save();
    }
}

exports.checkToken = async (req, res, next) => {
    let token = null;
    let monolitoEjs = (req.headers.accept && req.headers.accept.includes('text/html')) ? true : false;
    try {

        if (monolitoEjs) {
            token = req.cookies.tokenApiMultiDevice
        } else {
            const authHeader = req.headers['authorization']
            token = (authHeader && authHeader.split(" ")[1])
        }
        if (!token) {
            if (monolitoEjs) {
                req.flash('error', '');
                return res.redirect('/auth/login');
            } else {
                return res.status(401).json({ message: 'Token inválido!' })
            }
        }

        try {

            const secret = process.env.SECRET
            const decodedToken = jwt.verify(token, secret)

            const userId = decodedToken.id
            const user = await User.findById(userId, "-password")
                .populate(
                // {
                //     path: "roles",
                //     populate: [
                //         {
                //             path: "permissions",
                //             model: "Permissions",
                //         },
                //     ],
                // }
            )
                .exec();
            if (!user) {
                if (monolitoEjs) {
                    req.flash('error', 'Usuário não encontrado!');
                    return res.redirect('/auth/login');
                } else {
                    return res.status(401).json({ message: 'Usuário não encontrado!' })
                }
            }
            const timeLimitLogin = 15;
            await checkAndUpdateLastAccess(user, timeLimitLogin, token);

            if (user.blockAccess) {
                if (monolitoEjs) {
                    req.flash('error', 'Usuário bloqueado.');
                    return res.redirect('/auth/login');
                } else {
                    return res.status(404).json({ message: "Acesso bloqueado!" });
                }

            }
            req.userId = userId
            req.user = user
            // next logout
            req.token = token
            next()
        } catch (error) {
            if (monolitoEjs) {
                req.flash('error', 'Token inválido!');
                return res.redirect('/auth/login');
            } else {
                res.status(401).json({ message: "Token inválido!" })
            }
        }

    } catch (error) {
        if (monolitoEjs) {
            req.flash('error', 'Token inválido!');
            return res.redirect('/auth/login');
        } else {
            return res.status(401).json({ message: 'Token inválido!' })
        }
    }

}