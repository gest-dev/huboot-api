import ContactModel from '../models/Contacts.model.js';

async function getAllContacts(req, res) {
    const instance = req.query?.key
    let data = []
    try {
        data = await ContactModel.find({ instance: instance })
    } catch (error) {
        data = []
    }

    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        instance_data: data,
    })
}

export default {
    getAllContacts
}

