// Função para formatar o número de telefone
import VerifiNumberId from '../class/verifiNumberId.js';

async function onWhatsapp(req, res) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Número de telefone inválido. Envie o número completo com 13 ou 12 dígitos, incluindo DDI (55), DDD (ex: 11) e número com 9 dígitos iniciando por 9. Exemplo: 5511900000000 ou sem o 9  Exemplo: 551100000000',
        });
    }
    const data = await WhatsAppInstances[req.query.key]?.verifyId(
        WhatsAppInstances[req.query.key]?.getWhatsAppId(req.query.id)
    )
    return res.status(201).json({ error: false, data: data })
}

async function downProfile(req, res) {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Número de telefone inválido. Envie o número completo com 13 ou 12 dígitos, incluindo DDI (55), DDD (ex: 11) e número com 9 dígitos iniciando por 9. Exemplo: 5511900000000 ou sem o 9  Exemplo: 551100000000',
        });
    }
    const data = await WhatsAppInstances[req.query.key]?.DownloadProfile(
        formatPhoneNumberId
    )
    return res.status(201).json({ error: false, data: data })
}
async function getStatus(req, res) {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Número de telefone inválido. Envie o número completo com 13 ou 12 dígitos, incluindo DDI (55), DDD (ex: 11) e número com 9 dígitos iniciando por 9. Exemplo: 5511900000000 ou sem o 9  Exemplo: 551100000000',
        });
    }
    const data = await WhatsAppInstances[req.query.key]?.getUserStatus(
        formatPhoneNumberId
    )
    return res.status(201).json({ error: false, data: data })
}

async function blockUser(req, res) {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Número de telefone inválido. Envie o número completo com 13 ou 12 dígitos, incluindo DDI (55), DDD (ex: 11) e número com 9 dígitos iniciando por 9. Exemplo: 5511900000000 ou sem o 9  Exemplo: 551100000000',
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

async function updateProfilePicture(req, res) {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Número de telefone inválido. Envie o número completo com 13 ou 12 dígitos, incluindo DDI (55), DDD (ex: 11) e número com 9 dígitos iniciando por 9. Exemplo: 5511900000000 ou sem o 9  Exemplo: 551100000000',
        });
    }
    const data = await WhatsAppInstances[req.query.key].updateProfilePicture(
        formatPhoneNumberId,
        req.body.url
    )
    return res.status(201).json({ error: false, data: data })
}

async function getUserOrGroupById(req, res) {
    let formatPhoneNumberId = VerifiNumberId.formatPhoneNumber(req.query.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Número de telefone inválido. Envie o número completo com 13 ou 12 dígitos, incluindo DDI (55), DDD (ex: 11) e número com 9 dígitos iniciando por 9. Exemplo: 5511900000000 ou sem o 9  Exemplo: 551100000000',
        });
    }
    const data = await WhatsAppInstances[req.query.key].getUserOrGroupById(
        formatPhoneNumberId
    )
    return res.status(201).json({ error: false, data: data })
}

export default {
    onWhatsapp,
    downProfile,
    getStatus,
    blockUser,
    updateProfilePicture,
    getUserOrGroupById
}