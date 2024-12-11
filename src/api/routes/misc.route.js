const express = require('express')
const controller = require('../controllers/misc.controller')
const keyVerify = require('../middlewares/keyCheck')
const loginVerify = require('../middlewares/loginCheck')
const { ChechTokenKeyInstance } = require("../middlewares/ChechTokenKeyInstance");
const router = express.Router()

router.route('/onwhatsapp').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.onWhatsapp)
router.route('/downProfile').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.downProfile)
router.route('/getStatus').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.getStatus)
router.route('/blockUser').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.blockUser)
router
    .route('/updateProfilePicture')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.updateProfilePicture)
router
    .route('/getuserorgroupbyid')
    .get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.getUserOrGroupById)
module.exports = router
