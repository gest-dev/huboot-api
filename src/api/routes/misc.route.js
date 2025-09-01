import express from 'express';
import controller from '../controllers/misc.controller.js';
import keyVerify from '../middlewares/keyCheck.js';
import loginVerify from '../middlewares/loginCheck.js';
import { ChechTokenKeyInstance } from '../middlewares/ChechTokenKeyInstance.js';

const router = express.Router();

router.route('/onwhatsapp').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.onWhatsapp);
router.route('/downProfile').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.downProfile);
router.route('/getStatus').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.getStatus);
router.route('/blockUser').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.blockUser);
router.route('/updateProfilePicture').post(ChechTokenKeyInstance, keyVerify, loginVerify, controller.updateProfilePicture);
router.route('/getuserorgroupbyid').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.getUserOrGroupById);

export default router;
