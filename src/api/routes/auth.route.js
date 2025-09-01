import express from 'express';
import controller from '../controllers/auth.controller.js';
import { checkToken } from '../middlewares/ChechToken.js';

const router = express.Router();

// Rota para exibir a página de login
router.get('/', checkToken, (req, res) => {
  res.json({ message: 'OK' });
});

// Rota para processar o login
router.route('/login').get(controller.loginIndex);
router.route('/login').post(controller.login);

router.route('/logout').delete(checkToken, controller.logout);

router.route('/register').get(controller.registerIndex);
router.route('/register').post(controller.register);

export default router;
