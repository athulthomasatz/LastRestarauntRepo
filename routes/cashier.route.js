const express = require('express')
const router = express.Router()
const cashierController = require("../controllers/cashier.controller")
const { verifyCashierAuth } =require('../middleware/auth')

router.get('/',cashierController.getCashierPage )
router.get('/login', cashierController.getCashierLoginPage ) 
router.post('/login',cashierController.postCashierLoginPage) 
router.get('/signup',cashierController.getCashierSignup)
router.post('/signup',cashierController.postCashierSignup) 
router.get('/cashierDashboard',verifyCashierAuth,cashierController.getCashierDashboard) 
router.get('/OngoingOrder',verifyCashierAuth,cashierController.getOngoingOrders)
router.post('/changePaymentStatus',verifyCashierAuth,cashierController.changePaymentStatus) 
router.get('/logout',verifyCashierAuth,cashierController.getCashierLogout)

module.exports = router; 