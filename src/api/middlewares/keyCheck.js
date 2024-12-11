const Instances = require('../models/instances.model')

async function keyVerification(req, res, next) {
    const key = req.query['key']?.toString()
    if (!key) {
        return res
            .status(403)
            .send({ error: true, message: 'no key query was present' })
    }
    let InstanceInfo = await Instances.findOne({ key: key });
    if (!InstanceInfo) {
        return res
            .status(403)
            .send({ error: true, message: 'invalid key supplied DB' })
    }
    const instance = WhatsAppInstances[key]
    if (!instance) {
        return res
            .status(403)
            .send({ error: true, message: 'invalid key supplied Session' })
    }
    next()
}

module.exports = keyVerification
