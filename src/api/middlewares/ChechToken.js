import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import InvalidToken from '../models/InvalidToken.model.js';
import { isBefore, addMinutes } from 'date-fns';
import config from '../../config/config.js';

// Função para verificar e atualizar lastAccessAt
async function checkAndUpdateLastAccess(user, timeLimitLogin, token) {
    const currentDate = new Date();
    const fifteenMinutesLater = addMinutes(currentDate, timeLimitLogin);

    if (user?.lastAccessAt) {
        if (isBefore(user.lastAccessAt, currentDate)) {
            // Invalidando token
            const invalid = await InvalidToken.findOne({ token });
            if (!invalid) {
                const blackList = new InvalidToken({ token });
                await blackList.save();
            }

            // Limpar lastAccessAt e lastAuthToken
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

export const checkToken = async (req, res, next) => {
    let token = null;
    const monolitoEjs = req.headers.accept?.includes('text/html') ?? false;

    try {
        if (monolitoEjs) {
            token = req.cookies.tokenApiMultiDevice;
        } else {
            const authHeader = req.headers['authorization'];
            token = authHeader?.split(' ')[1];
        }

        if (!token) {
            if (monolitoEjs) {
                req.flash('error', '');
                return res.redirect('/auth/login');
            } else {
                return res.status(401).json({ message: 'Token inválido!' });
            }
        }

        try {
            const secret = config.auth.SECRET;
            const decodedToken = jwt.verify(token, secret);
            const userId = decodedToken.id;

            const user = await User.findById(userId, "-password")
                .populate()
                // {
                //     path: "roles",
                //     populate: [
                //         {
                //             path: "permissions",
                //             model: "Permissions",
                //         },
                //     ],
                // }
                .exec();

            if (!user) {
                if (monolitoEjs) {
                    req.flash('error', 'Usuário não encontrado!');
                    return res.redirect('/auth/login');
                } else {
                    return res.status(401).json({ message: 'Usuário não encontrado!' });
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

            req.userId = userId;
            req.user = user;
            req.token = token;
            next();

        } catch (err) {
            if (monolitoEjs) {
                req.flash('error', 'Token inválido!');
                return res.redirect('/auth/login');
            } else {
                return res.status(401).json({ message: "Token inválido!" });
            }
        }

    } catch (err) {
        if (monolitoEjs) {
            req.flash('error', 'Token inválido!');
            return res.redirect('/auth/login');
        } else {
            return res.status(401).json({ message: 'Token inválido!' });
        }
    }
};
