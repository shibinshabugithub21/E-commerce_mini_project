const express = require('express');
const router = express.Router();
const mongoose = express('mongoose')
const usercontroller = require('../controller/usercontroller');
const orderController = require("../controller/orderController");
const profileController = require("../controller/userProfileController")
const collectionModel = require('../models/userdb');
const {isUser,checkSessionAndBlocked} = require('../middleware/userside');





router.get('/',usercontroller.landing);
// router.post('/',usercontroller.homepost) 

router.get('/login',usercontroller.login);
router.post('/login',usercontroller.loginpost)
router.get('/logout',usercontroller.logout)

router.get('/signup',usercontroller.signup);
router.post('/signup',usercontroller.signuppost);

router.get('/emailforget',usercontroller.forget);
router.post("/emailforget",usercontroller.forgetpost)
router.get("/forgetPassword/:token",usercontroller.forgetPassword);
router.post('/resetPassword/:email',usercontroller.resetPassword)

router.get('/otp',usercontroller.otp)
router.post('/otppost',usercontroller.otppost)

// resend otp
router.get('/resendotp',usercontroller.resendOtp)

router.get('/home',checkSessionAndBlocked,usercontroller.home);
// router.get('/home',checkSessionAndBlocked,usercontroller.home);

// user accouts detals 
// router.get('/profile',usercontroller.profile)





// products routes(here product means the iphone )
router.get('/products',usercontroller.products)
router.get('/mac',usercontroller.mac)
router.get('/airpod',usercontroller.airpod);
router.get('/watch',usercontroller.watch);

// cart starts

router.post('/cart/:id',usercontroller.Addcart)
router.get('/cart',usercontroller.loadcart)
router.post('/cartupdate/:id',usercontroller.cartQuantityUpdate);
router.delete('/cartDelete/:id',usercontroller.cartDelete);

// // checkout page
router.get('/CheckOutPage',usercontroller.checkoutpage)
router.get("/AddressUpdate",usercontroller.addressAdding)
router.post('/AddressUpdate',usercontroller.addressAddingpost)
router.post('/CheckOut',usercontroller.orderSuccess)
router.post('/create',usercontroller.razor)



// profile
router.get('/profile',profileController.profile)
router.post("/updateprofile",profileController.updateprofile)
// profile password
router.get("/managePassword",profileController.managePassword)
router.post("/changePassword", profileController.changePassword);
// profile address
router.get('/manageaddress',profileController.manageAddress)
router.get("/addAddress",profileController.addAddress)
router.post('/addAddress', profileController.addAddresspost);
router.get ("/editaddress/:id",profileController.editAddress)
router.post("/editaddress/:id", profileController.editAddresspost);
// Define the route for deleting an address
router.get("/deleteAddress/:id", profileController.deleteAddress);

// oreder
router.get("/order",orderController.order)
router.get('/addressadding',usercontroller.addressAdding)
router.post('/addAddrresscheckout', usercontroller.addressAddingpost);
router.post('/cancelOrder/:orderId/:productId', orderController.cancelOrder);
router.post('/returnProduct',orderController.orderReturn);

// wishlsit
router.get('/wishlist',usercontroller.whishlistload);
router.post('/wishlist/:id',usercontroller.addingWhishList)
router.get('/wishlistdelete/:id',usercontroller.WhishProductDelete)

// wallet
router.get('/wallet',usercontroller.wallet)

// produt details
router.get('/details/:id',usercontroller.details)


router.get("/success",usercontroller.success)
module.exports = router;
