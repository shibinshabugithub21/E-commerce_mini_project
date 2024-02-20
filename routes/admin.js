// adminrouter.js
const express = require('express');
const { upload } = require('../middleware/multer');
const adminrouter = express.Router();
const admincontroller = require('../controller/admincontroller');
const { isAdmin } = require('../middleware/adminside'); // Import the isAdmin middleware

// ... Other imports

adminrouter.get('/login', admincontroller.login);
adminrouter.post('/login', admincontroller.loginpost);
adminrouter.get("/logout", admincontroller.logout);

// Use the isAdmin middleware for protected routes
adminrouter.use(isAdmin);

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
adminrouter.get('/deleteproduct/:id', admincontroller.deleteproduct);
adminrouter.post('/isdelete/:id', admincontroller.isdelete);
adminrouter.post('/notdelete/:id', admincontroller.notdelete);

module.exports = adminrouter;
