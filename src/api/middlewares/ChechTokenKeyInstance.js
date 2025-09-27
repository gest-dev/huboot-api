import jwt from 'jsonwebtoken';
import Instances from '../models/instances.model.js';
import config from '../../config/config.js';

export const ChechTokenKeyInstance = async (req, res, next) => {
    let token = null;

    try {
        const keyQuery = req.query?.key;
        const authHeader = req.headers['authorization'];
        token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token inválido! 1' });
        }

        try {
            const secret = config.auth.SECRET;
            const decodedToken = jwt.verify(token, secret);

            const instanceKey = decodedToken.key;
            const instanceInfo = await Instances.findOne({ key: instanceKey }).exec();

            if (!instanceInfo) {
                return res.status(401).json({ message: 'Instance não encontrada!' });
            }

            if (instanceKey !== keyQuery) {
                return res.status(401).json({ message: 'Token inválido para esta instância!' });
            }

            req.instanceKey = instanceKey;
            req.token = token;
            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({ message: 'Token inválido! 2' });
        }

    } catch (err) {
        return res.status(401).json({ message: 'Token inválido! 3' });
    }
};
