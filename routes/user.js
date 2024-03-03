const express = require('express');
const router = express.Router();
const mongoose = express('mongoose')
const usercontroller = require('../controller/usercontroller');
const collectionModel = require('../models/userdb');
const {isUser,checkSessionAndBlocked} = require('../middleware/userside');





router.get('/',usercontroller.landing);
// router.post('/',usercontroller.homepost) 

router.get('/login',usercontroller.login);
router.post('/login',usercontroller.loginpost)
router.get('/logout',usercontroller.logout)

router.get('/signup',usercontroller.signup);
router.post('/signup',usercontroller.signuppost);

router.get('/forget',usercontroller.forget);
// router.post('/numberValidation',usercontroller.numberValidation)
// router.post('/newPassword',userController.newPassword)
// router.post('/resetPassword',userController.resetPassword)

router.get('/otp',usercontroller.otp)
router.post('/otppost',usercontroller.otppost)

// resend otp
router.get('/resendotp',usercontroller.resendOtp)

router.get('/home',checkSessionAndBlocked,usercontroller.home);
// router.get('/home',checkSessionAndBlocked,usercontroller.home);

// user accouts detals 
// router.get('/profile',usercontroller.profile)


// test
router.get("/test",(req,res)=>{
    res.render("user/test")
})


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
router.get('/profile',usercontroller.profile)
router.post("/updateprofile",usercontroller.updateprofile)
// profile password
router.get("/managePassword",usercontroller.managePassword)
router.post("/changePassword", usercontroller.changePassword);
// profile address
router.get('/manageaddress',usercontroller.manageAddress)
router.get("/addAddress",usercontroller.addAddress)
router.post('/addAddress', usercontroller.addAddresspost);
router.get ("/editaddress/:id",usercontroller.editAddress)
router.post("/editaddress/:id", usercontroller.editAddresspost);
// Define the route for deleting an address
router.get("/deleteAddress/:id", usercontroller.deleteAddress);

// oreder
router.get("/order",usercontroller.order)
router.get('/addressadding',usercontroller.addressAdding)
router.post('/addAddrresscheckout', usercontroller.addressAddingpost);
router.post('/cancelOrder/:orderId/:productId', usercontroller.cancelOrder);
router.post('/returnProduct',usercontroller.orderReturn);

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
