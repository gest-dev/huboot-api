const express = require('express')
const controller = require('../controllers/message.controller')
const keyVerify = require('../middlewares/keyCheck')
const loginVerify = require('../middlewares/loginCheck')
const countSendMsg = require('../middlewares/countSendMsg')
const multer = require('multer')
const { ChechTokenKeyInstance } = require("../middlewares/ChechTokenKeyInstance");

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage, inMemory: true }).single('file')

router.route('/text').post(ChechTokenKeyInstance, keyVerify, loginVerify, countSendMsg, controller.Text)
router.route('/image').post(ChechTokenKeyInstance, keyVerify, loginVerify, upload, countSendMsg, controller.Image)
router.route('/video').post(ChechTokenKeyInstance, keyVerify, loginVerify, upload, countSendMsg, controller.Video)
router.route('/audio').post(ChechTokenKeyInstance, keyVerify, loginVerify, upload, countSendMsg, controller.Audio)
router.route('/doc').post(ChechTokenKeyInstance, keyVerify, loginVerify, upload, countSendMsg, controller.Document)
router.route('/mediaurl').post(ChechTokenKeyInstance, keyVerify, loginVerify, countSendMsg, controller.Mediaurl)
router.route('/button').post(ChechTokenKeyInstance, keyVerify, loginVerify, countSendMsg, controller.Button)
router.route('/contact').post(ChechTokenKeyInstance, keyVerify, loginVerify, countSendMsg, controller.Contact)
router.route('/list').post(ChechTokenKeyInstance, keyVerify, loginVerify, countSendMsg, controller.List)
router
    .route('/mediabutton')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, countSendMsg, controller.MediaButton)

router.route('/setstatus').put(ChechTokenKeyInstance, keyVerify, loginVerify, controller.SetStatus)
router.route("/read").post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.Read)
router.route("/react").post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.React)

module.exports = router
