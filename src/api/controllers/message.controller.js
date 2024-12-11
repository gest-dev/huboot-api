// Função para formatar o número de telefone
const { VerifiNumberId } = require('../class/verifiNumberId')

exports.Text = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }

    try {
        const data = await WhatsAppInstances[req.query.key].sendTextMessage(
            formatPhoneNumberId,
            req.body.message
        );
        //console.log(`Response data: ${JSON.stringify(data)}`); // Log de depuração
        return res.status(201).json({ error: false, data: data });
    } catch (error) {
        console.error(`Error in controller: ${error.message}`); // Log de depuração
        return res.status(500).json({ error: true, message: error.message });
    }
}

exports.Image = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        formatPhoneNumberId,
        req.file,
        'image',
        req.body?.caption
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Video = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        formatPhoneNumberId,
        req.file,
        'video',
        req.body?.caption
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Audio = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        formatPhoneNumberId,
        req.file,
        'audio'
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Document = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendMediaFile(
        formatPhoneNumberId,
        req.file,
        'document',
        '',
        req.body.filename
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Mediaurl = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendUrlMediaFile(
        formatPhoneNumberId,
        req.body.url,
        req.body.type, // Types are [image, video, audio, document]
        req.body.mimetype, // mimeType of mediaFile / Check Common mimetypes in `https://mzl.la/3si3and`
        req.body.caption
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Button = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendButtonMessage(
        formatPhoneNumberId,
        req.body.btndata
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Contact = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendContactMessage(
        formatPhoneNumberId,
        req.body.vcard
    )
    return res.status(201).json({ error: false, data: data })
}

exports.List = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendListMessage(
        formatPhoneNumberId,
        req.body.msgdata
    )
    return res.status(201).json({ error: false, data: data })
}

exports.MediaButton = async (req, res) => {
    let group = req.body?.group || false;
    let formatPhoneNumberId = group ? req.body.id : VerifiNumberId.formatPhoneNumber(req.body.id);

    if (formatPhoneNumberId === null) {
        return res.status(429).json({
            error: true,
            message: 'Invalid phone number',
        });
    }
    const data = await WhatsAppInstances[req.query.key].sendMediaButtonMessage(
        formatPhoneNumberId,
        req.body.btndata
    )
    return res.status(201).json({ error: false, data: data })
}

exports.SetStatus = async (req, res) => {
    const presenceList = [
        'unavailable',
        'available',
        'composing',
        'recording',
        'paused',
    ]
    if (presenceList.indexOf(req.body.status) === -1) {
        return res.status(400).json({
            error: true,
            message:
                'status parameter must be one of ' + presenceList.join(', '),
        })
    }

    const data = await WhatsAppInstances[req.query.key]?.setStatus(
        req.body.status,
        req.body.id
    )
    return res.status(201).json({ error: false, data: data })
}

exports.Read = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].readMessage(req.body.msg)
    return res.status(201).json({ error: false, data: data })
}

exports.React = async (req, res) => {
    const data = await WhatsAppInstances[req.query.key].reactMessage(req.body.id, req.body.key, req.body.emoji)
    return res.status(201).json({ error: false, data: data })
}
