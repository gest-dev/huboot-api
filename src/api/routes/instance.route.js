import express from 'express';
const router = express.Router();

import controller from '../controllers/instance.controller.js';
import keyVerify from '../middlewares/keyCheck.js';
import loginVerify from '../middlewares/loginCheck.js';
import { checkToken } from '../middlewares/ChechToken.js';
import { ChechTokenKeyInstance } from '../middlewares/ChechTokenKeyInstance.js';

// part auth
router.route('/new').post(checkToken, controller.newInstance);
router.route('/list').get(checkToken, controller.list);
router.route('/init').get(checkToken, controller.init);
router.route('/qr').get(checkToken, keyVerify, controller.qr);
router.route('/qrbase64').get(checkToken, keyVerify, controller.qrbase64);
router.route('/info').get(checkToken, controller.info);
router.route('/restore/all').get(checkToken, controller.restoreAll);
router.route('/restore').get(checkToken, controller.restore);

// logout session whatsapp
router.route('/logout').delete(checkToken, keyVerify, loginVerify, controller.logout);

// clear chat session database
router.route('/delete').delete(checkToken, keyVerify, controller.deleteInstance);

// clear complete database general instance
router.route('/delete/general').delete(checkToken, controller.deleteGeneral);

// part token key access
// instance status exter
router.route('/status').get(ChechTokenKeyInstance, keyVerify, loginVerify, controller.status);

export default router;
