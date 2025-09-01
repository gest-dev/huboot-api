import express from 'express';
const router = express.Router();

import instanceRoutes from './instance.route.js';
import messageRoutes from './message.route.js';
import miscRoutes from './misc.route.js';
import groupRoutes from './group.route.js';
import authRoutes from './auth.route.js';
import managerRoutes from './manager.route.js';
import contactRoutes from './contact.route.js';

// rateLimiter
import throttle from '../middlewares/rateLimiter.js';

// Rotas
router.get('/status', throttle(15), (req, res) => res.send('OK'));
router.use('/auth', throttle(15), authRoutes);
router.use('/manager', throttle(15), managerRoutes);
router.use('/instance', throttle(15), instanceRoutes);
router.use('/message', throttle(15), messageRoutes);
router.use('/group', throttle(15), groupRoutes);
router.use('/misc', throttle(15), miscRoutes);
router.use('/contact', throttle(15), contactRoutes);

export default router;
