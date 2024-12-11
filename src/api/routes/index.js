const express = require('express')
const router = express.Router()
const instanceRoutes = require('./instance.route')
const messageRoutes = require('./message.route')
const miscRoutes = require('./misc.route')
const groupRoutes = require('./group.route')
const authRoutes = require("./auth.route");
const managerRoutes = require("./manager.route");
const contactRoutes = require("./contact.route");

//rateLimiter
const throttle = require("../middlewares/rateLimiter");
//auth

router.get('/status', throttle(10), (req, res) => res.send('OK'))
router.use('/auth', throttle(10), authRoutes)
//manager
router.use('/manager', throttle(10), managerRoutes)
router.use('/instance', throttle(10), instanceRoutes)
router.use('/message', throttle(10), messageRoutes)
router.use('/group', throttle(10), groupRoutes)
router.use('/misc', throttle(10), miscRoutes)
router.use('/contact', throttle(10), contactRoutes)


module.exports = router
