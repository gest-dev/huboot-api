export default function loginVerification(req, res, next) {
    const key = req.query['key']?.toString();

    if (!key) {
        return res.status(403).json({ error: true, message: 'no key query was present' });
    }

    const instance = global.WhatsAppInstances[key]; // Assumindo que WhatsAppInstances é global

    if (!instance?.instance?.online) {
        return res.status(401).json({ error: true, message: "phone isn't connected" });
    }

    next();
}
