// adminrouter.js
const express = require('express');
const { upload } = require('../middleware/multer');
const adminrouter = express.Router();
const admincontroller = require('../controller/admincontroller');
const { isAdmin,authMiddleware } = require('../middleware/adminside'); 

// ... Other imports

adminrouter.get('/login', admincontroller.login);
adminrouter.post('/login', admincontroller.loginpost);
adminrouter.get("/logout", admincontroller.logout);
// Use the isAdmin middleware for protected routes
adminrouter.use(isAdmin);
adminrouter.use(authMiddleware)

adminrouter.get('/home', admincontroller.home);

// user starts
adminrouter.get('/user', admincontroller.user);
adminrouter.post('/isblocked/:id', admincontroller.isBlocked);
adminrouter.post('/notblocked/:id', admincontroller.notBlocked);

// category starts
adminrouter.get('/category', admincontroller.category);
adminrouter.get('/addcategory', admincontroller.addcategory);
adminrouter.post('/addcategory', admincontroller.addcategorypost);
adminrouter.get("/editcatgory/:id", admincontroller.editcategory);
adminrouter.post("/editcategory/:id", admincontroller.update);
adminrouter.get("/delete/:id", admincontroller.deletecategory);
// category ends

// product starts
adminrouter.get('/product', admincontroller.product);
adminrouter.get("/addproduct", admincontroller.addproduct);
adminrouter.post("/addproduct", upload.array('image'), admincontroller.addproductpost);
adminrouter.get("/editproduct/:id", admincontroller.editproduct);
adminrouter.post("/editproduct/:id", upload.array('image'), admincontroller.editproductpost);
adminrouter.post("/proImgEdite/:id",admincontroller.deletImage)
adminrouter.get('/deleteproduct/:id', admincontroller.deleteproduct);
adminrouter.post('/isdelete/:id', admincontroller.isdelete);
adminrouter.post('/notdelete/:id', admincontroller.notdelete);

// order stats
adminrouter.get("/order",admincontroller.order);
adminrouter.post('/order/:orderId/:itemId',admincontroller.orderput);

// coupoun status
adminrouter.get('/coupoun',admincontroller.coupounsList)
adminrouter.get('/couponsAdding',admincontroller.couponsAdding)
adminrouter.post("/addcoupon",admincontroller.couponCreation)
adminrouter.post("/coupoun/delete/:id", admincontroller.coupounDelete);
// adminrouter.get("/coupon/block/:id", admincontroller.blockCoupon);
// adminrouter.get("/coupon/unblock/:id", admincontroller.unblockCoupon);

// banner Starts
adminrouter.get("/banner",admincontroller.BannerList)
adminrouter.get("/addbanner",admincontroller.AddBanner)
adminrouter.post('/addbanner',upload.array('bannerImage'),admincontroller.AddBannerPost)
adminrouter.get("/deletebanner/:id",admincontroller.DeleteBanner)
adminrouter.post("/blockbanner/:id", admincontroller.BlockBanner);

// sales starts
adminrouter.get('/sale',admincontroller.sales)
adminrouter.get('/pdf',admincontroller.generatePDF)

adminrouter.get('/excel', admincontroller.downloadExcel);





module.exports = adminrouter;
