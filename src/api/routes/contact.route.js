import express from 'express';
import controller from '../controllers/contact.controller.js';
import { ChechTokenKeyInstance } from '../middlewares/ChechTokenKeyInstance.js';

const router = express.Router();

router.route('/all').get(ChechTokenKeyInstance, controller.getAllContacts);

export default router;
