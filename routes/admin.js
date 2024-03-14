// adminrouter.js
const express = require('express');
const { upload } = require('../middleware/multer');
const adminrouter = express.Router();
const admincontroller = require('../controller/admincontroller/admincontroller');
const Bannercontroller = require("../controller/admincontroller/Bannercontroller");
const categorycontroller = require("../controller/admincontroller/categorycontroller");
const productcontroller = require("../controller/admincontroller/productcontroller")
const coupouncontroller = require('../controller/admincontroller/coupouncontroller')
const { isAdmin,authMiddleware } = require('../middleware/adminside'); 

// ... Other imports

adminrouter.get('/login', admincontroller.login);
adminrouter.post('/login', admincontroller.loginpost);
adminrouter.get("/logout", admincontroller.logout);
// Use the isAdmin middleware for protected routes
adminrouter.use(isAdmin);
adminrouter.use(authMiddleware)

adminrouter.get('/home', admincontroller.home);
adminrouter.post("/graph",admincontroller.graph)

// user starts
adminrouter.get('/user', admincontroller.user);
adminrouter.post('/isblocked/:id', admincontroller.isBlocked);
adminrouter.post('/notblocked/:id', admincontroller.notBlocked);

// category starts
adminrouter.get('/category',categorycontroller.category);
adminrouter.get('/addcategory', categorycontroller.addcategory);
adminrouter.post('/addcategory', categorycontroller.addcategorypost);
adminrouter.get("/editcatgory/:id", categorycontroller.editcategory);
adminrouter.post("/editcategory/:id",categorycontroller.update);
adminrouter.get("/delete/:id", categorycontroller.deletecategory);
adminrouter.get('/block/:id', categorycontroller.blockCategory);
adminrouter.get('/unblock/:id', categorycontroller.unblockCategory);
// category ends

// product starts
adminrouter.get('/product', productcontroller.product);
adminrouter.get("/addproduct", productcontroller.addproduct);
adminrouter.post("/addproduct", upload.array('image'), productcontroller.addproductpost);
adminrouter.get("/editproduct/:id",productcontroller.editproduct);
adminrouter.post("/editproduct/:id", upload.array('image'),productcontroller.editproductpost);
adminrouter.post("/proImgEdite/:id",productcontroller.deletImage)
adminrouter.get('/deleteproduct/:id',productcontroller.deleteproduct);
adminrouter.post('/isdelete/:id',productcontroller.isdelete);
adminrouter.post('/notdelete/:id',productcontroller.notdelete);

// order stats
adminrouter.get("/order",admincontroller.order);
adminrouter.post('/order/:orderId/:itemId',admincontroller.orderput);

// coupoun status
adminrouter.get('/coupoun',coupouncontroller.coupounsList)
adminrouter.get('/couponsAdding',coupouncontroller.couponsAdding)
adminrouter.post("/addcoupon",coupouncontroller.couponCreation)
adminrouter.post("/coupoun/delete/:id", coupouncontroller.coupounDelete);
// adminrouter.get("/coupon/block/:id", admincontroller.blockCoupon);
// adminrouter.get("/coupon/unblock/:id", admincontroller.unblockCoupon);

// banner Starts
adminrouter.get("/banner",Bannercontroller.BannerList)
adminrouter.get("/addbanner",Bannercontroller.AddBanner)
adminrouter.post('/addbanner',upload.array('bannerImage'),Bannercontroller.AddBannerPost)
adminrouter.get("/deletebanner/:id",Bannercontroller.DeleteBanner)
adminrouter.post("/blockbanner/:id", Bannercontroller.BlockBanner);

// sales starts
adminrouter.get('/sale',admincontroller.sales)
adminrouter.get('/pdf',admincontroller.generatePDF)
adminrouter.post('/excel', admincontroller.downloadExcel);





module.exports = adminrouter;
