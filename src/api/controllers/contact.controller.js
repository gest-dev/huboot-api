const ContactModel = require('../models/Contacts.model')

exports.getAllContacts = async (req, res) => {
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

