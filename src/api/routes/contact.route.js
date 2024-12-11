const express = require('express')
const controller = require('../controllers/contact.controller')

const { ChechTokenKeyInstance } = require("../middlewares/ChechTokenKeyInstance");
const router = express.Router()

router.route('/all').get(ChechTokenKeyInstance, controller.getAllContacts)

module.exports = router