const express = require('express');
const router = express.Router();
const mongoose = express('mongoose')
const authcontroller = require("../controller/usercontroller/userauth")
const usercontroller = require('../controller/usercontroller/usercontroller');
const orderController = require("../controller/usercontroller/orderController");
const profileController = require("../controller/usercontroller/userProfileController")
const wishlistController =  require("../controller/usercontroller/userwishlist")
const cartcontroller = require("../controller/usercontroller/usercartcontroller")
const detailscontroller = require("../controller/usercontroller/userproductdetails")
const collectionModel = require('../models/userdb');
const {isUser,checkSessionAndBlocked} = require('../middleware/userside');





router.get('/',authcontroller.landing);
// router.post('/',usercontroller.homepost) 

router.get('/login',authcontroller.login);
router.post('/login',authcontroller.loginpost)
router.get('/logout',authcontroller.logout)

router.get('/signup',authcontroller.signup);
router.post('/signup',authcontroller.signuppost);

router.get('/emailforget',authcontroller.forget);
router.post("/emailforget",authcontroller.forgetpost)
router.get("/forgetPassword/:token",authcontroller.forgetPassword);
router.post('/resetPassword/:email',authcontroller.resetPassword)

router.get('/otp',authcontroller.otp)
router.post('/otppost',authcontroller.otppost)

// resend otp
router.get('/resendotp',authcontroller.resendOtp)

router.get('/home',checkSessionAndBlocked,authcontroller.home);
// router.get('/home',checkSessionAndBlocked,usercontroller.home);

// products routes(here product means the iphone )
router.get('/iPhone',detailscontroller.products)
router.get('/mac',detailscontroller.mac)
router.get('/airpods',detailscontroller.airpod);
router.get('/watch',detailscontroller.watch);
// produt details
router.get('/details/:id',detailscontroller.details)



// cart starts

router.post('/cart/:id',cartcontroller.Addcart)
router.get('/cart',cartcontroller.loadcart)
router.post('/cartupdate/:id',cartcontroller.cartQuantityUpdate);
router.delete('/cartDelete/:id',cartcontroller.cartDelete);

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
router.get('/wishlist',wishlistController.whishlistload);
router.post('/wishlist/:id',wishlistController.addingWhishList)
router.get('/wishlistdelete/:id',wishlistController.WhishProductDelete)

// wallet
router.get('/wallet',usercontroller.wallet)



router.get("/success",usercontroller.success)
module.exports = router;
