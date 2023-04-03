const express = require('express')
const router = express.Router() 
const guestController = require('../controllers/guest.controller') 
const { verifyGuestAuth } = require('../middleware/auth')

router.get('/', guestController.getWelcomePage)

router.get('/Guest-Details',guestController.getGuestdetails)
router.post('/Guest-Details',guestController.postGuestdetails)

router.get('/menu',verifyGuestAuth, guestController.getGuestMenu) 
router.get('/menu/:categoryName',verifyGuestAuth, guestController.getGuestItems)

router.post('/cart',verifyGuestAuth,guestController.addtocart)
router.get('/cart-view',verifyGuestAuth,guestController.getGuestCartPage)

router.get('/order',verifyGuestAuth,guestController.getOrderPage)
router.post('/place-order',verifyGuestAuth,guestController.placeOrder)


router.get('/dashboard/search', verifyGuestAuth, guestController.dashboardSearch);
router.post('/dashboard/search',verifyGuestAuth, guestController.dashboardSearchSubmit);



module.exports = router;