const express = require('express')
const controller = require('../controllers/group.controller')
const keyVerify = require('../middlewares/keyCheck')
const loginVerify = require('../middlewares/loginCheck')
const { ChechTokenKeyInstance } = require("../middlewares/ChechTokenKeyInstance");
const router = express.Router()

router.route('/create').post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.create)
router.route('/listall').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.listAll)
router.route('/leave').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.leaveGroup)

router
    .route('/inviteuser')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.addNewParticipant)
router.route('/makeadmin').post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.makeAdmin)
router
    .route('/demoteadmin')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.demoteAdmin)
router
    .route('/getinvitecode')
    .get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.getInviteCodeGroup)
router
    .route('/getinstanceinvitecode')
    .get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.getInstanceInviteCodeGroup)
router
    .route('/getallgroups')
    .get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.getAllGroups)

//getAllGroupsDatabase
router
    .route('/getallgroupsdatabase')
    .get(ChechTokenKeyInstance, controller.getAllGroupsDatabase)

router
    .route('/participantsupdate')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.groupParticipantsUpdate)
router
    .route('/settingsupdate')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.groupSettingUpdate)
router
    .route('/updatesubject')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.groupUpdateSubject)
router
    .route('/updatedescription')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.groupUpdateDescription)
router
    .route('/inviteinfo')
    .post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.groupInviteInfo)
router.route('/groupjoin').post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.groupJoin)
module.exports = router
