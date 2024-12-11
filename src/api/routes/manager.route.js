const express = require('express')
const { checkToken } = require("../middlewares/ChechToken");
const router = express.Router()
const { instanceIndex } = require('../controllers/manager.controller')
// Rota para exibir a página de login
router.route('/').get(checkToken, (req, res) => {
  const key = req.query.key || null; // Ou obtenha o valor de onde for necessário
  res.render('manager/dashboard', { error: req.flash('error'), success: req.flash('success'), key: key });
});

router.route('/instance/:key').get(checkToken, instanceIndex);

module.exports = router
