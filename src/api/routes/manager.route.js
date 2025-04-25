const express = require('express')
const { checkToken } = require("../middlewares/ChechToken");
const router = express.Router()
const { instanceIndex,
  instanceEventsWebhookIndex,
  instanceEventsWebhookEdit,
  instanceEventsWebSocketIndex
} = require('../controllers/manager.controller')

router.route('/').get(checkToken, (req, res) => {
  const key = req.query.key || null; // Ou obtenha o valor de onde for necessário
  res.render('manager/dashboard', { error: req.flash('error'), success: req.flash('success'), key: key });
});

router.route('/instance/:key').get(checkToken, instanceIndex);

router.route('/instance/:key/events/webhook').get(checkToken, instanceEventsWebhookIndex);
// editar webhook
router.route('/instance/:key/events/webhook/edit').patch(checkToken, instanceEventsWebhookEdit);

//web-socket
router.route('/instance/:key/events/web-socket').get(checkToken, instanceEventsWebSocketIndex);


module.exports = router
