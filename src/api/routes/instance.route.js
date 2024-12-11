const express = require('express')
const controller = require('../controllers/instance.controller')
const keyVerify = require('../middlewares/keyCheck')
const loginVerify = require('../middlewares/loginCheck')
const { checkToken } = require("../middlewares/ChechToken");

const router = express.Router()

router.route('/new').post(checkToken, controller.new)
router.route('/list').get(checkToken, controller.list)
router.route('/init').get(checkToken, controller.init)
router.route('/qr').get(checkToken, keyVerify, controller.qr)
router.route('/qrbase64').get(checkToken, keyVerify, controller.qrbase64)
router.route('/info').get(checkToken, controller.info)
router.route('/restore/all').get(checkToken, controller.restoreAll)
router.route('/restore').get(checkToken, controller.restore)
// logout session whatsapp
router.route('/logout').delete(checkToken, keyVerify, loginVerify, controller.logout)
// clear chat session database
router.route('/delete').delete(checkToken, keyVerify, controller.delete)
// clear complete database general instance
router.route('/delete/general').delete(checkToken, controller.deleteGeneral)



module.exports = router
