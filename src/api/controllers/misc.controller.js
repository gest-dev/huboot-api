// Função para formatar o número de telefone
const { VerifiNumberId } = require('../class/verifiNumberId')

exports.onWhatsapp = async (req, res) => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const data = await WhatsAppInstances[req.query.key]?.verifyId(
        WhatsAppInstances[req.query.key]?.getWhatsAppId(req.query.id)
    )
    return res.status(201).json({ error: false, data: data })
}

exports.downProfile = async (req, res) => {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key]?.DownloadProfile(
        formatPhoneNumberId
    )
    return res.status(201).json({ error: false, data: data })
}

exports.getStatus = async (req, res) => {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key]?.getUserStatus(
        formatPhoneNumberId
    )
    return res.status(201).json({ error: false, data: data })
}

exports.blockUser = async (req, res) => {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key]?.blockUnblock(
        formatPhoneNumberId,
        req.query.block_status
    )
    if (req.query.block_status == 'block') {
        return res
            .status(201)
            .json({ error: false, message: 'Contact Blocked' })
    } else
        return res
            .status(201)
            .json({ error: false, message: 'Contact Unblocked' })
}

exports.updateProfilePicture = async (req, res) => {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].updateProfilePicture(
        formatPhoneNumberId,
        req.body.url
    )
    return res.status(201).json({ error: false, data: data })
}

exports.getUserOrGroupById = async (req, res) => {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].getUserOrGroupById(
        formatPhoneNumberId
    )
    return res.status(201).json({ error: false, data: data })
}
