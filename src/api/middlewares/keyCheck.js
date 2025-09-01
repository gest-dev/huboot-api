import Instances from '../models/instances.model.js';

export default async function keyVerification(req, res, next) {
    const key = req.query['key']?.toString();

    if (!key) {
        return res.status(403).json({ error: true, message: 'no key query was present' });
    }

    const InstanceInfo = await Instances.findOne({ key });

    if (!InstanceInfo) {
        return res.status(403).json({ error: true, message: 'invalid key supplied DB' });
    }

    const instance = global.WhatsAppInstances[key]; // Assumindo que WhatsAppInstances é global

    if (!instance) {
        return res.status(403).json({ error: true, message: 'invalid key supplied Session' });
    }

    next();
}
