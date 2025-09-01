import express from 'express';
import { checkToken } from '../middlewares/ChechToken.js';
const router = express.Router();

import managerController from '../controllers/manager.controller.js';

router.route('/').get(checkToken, (req, res) => {
  const key = req.query.key || null; // Ou obtenha o valor de onde for necessário
  res.render('manager/dashboard', { error: req.flash('error'), success: req.flash('success'), key: key });
});

router.route('/instance/:key').get(checkToken, managerController.instanceIndex);

router.route('/instance/:key/events/webhook').get(checkToken, managerController.instanceEventsWebhookIndex);

// editar webhook
router.route('/instance/:key/events/webhook/edit').patch(checkToken, managerController.instanceEventsWebhookEdit);

// web-socket
router.route('/instance/:key/events/web-socket').get(checkToken, managerController.instanceEventsWebSocketIndex);

export default router;
