const jwt = require('jsonwebtoken')
const Instances = require("../models/instances.model");

exports.ChechTokenKeyInstance = async (req, res, next) => {
    let token = null;

    try {
        let keyQuery = req.query?.key
        const authHeader = req.headers['authorization']
        token = (authHeader && authHeader.split(" ")[1])

        if (!token) {
            return res.status(401).json({ message: 'Token inválido! 1' })
        }

        try {

            const secret = process.env.SECRET
            const decodedToken = jwt.verify(token, secret)

            const instanceKey = decodedToken.key
            const instanceInfo = await Instances.findOne({
                key: instanceKey
            }).exec();

            if (!instanceInfo) {
                return res.status(401).json({ message: 'Instance não encontrada!' })
            }
            if (instanceKey != keyQuery) {
                return res.status(401).json({ message: 'Token inválido para esta instância!' })
            }

            req.instanceKey = instanceKey
            // next logout
            req.token = token
            next()
        } catch (error) {
            console.log(error);

            res.status(401).json({ message: "Token inválido! 2" })
        }

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido! 3' })

    }

}