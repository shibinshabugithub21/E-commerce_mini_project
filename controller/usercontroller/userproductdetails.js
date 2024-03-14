const { render } = require('ejs');
const { sendEmail,sendforgetpassword } = require('../../middleware/nodeMailer');
const nodemailer = require('nodemailer');
const collectionModel = require('../../models/userdb');

// const coll =require('../models/userdb');
const collectionOtp = require('../../models/otp');
const collectionProduct = require("../../models/product"); 
const collectionOrder = require('../../models/order');
const bcrypt = require("bcrypt");
const Razorpay = require('razorpay');
const collectionCoupoun = require('../../models/coupoun');
const BannerDB = require("../../models/bannerdb");
const collectionCat = require('../../models/category');

// iphone
const products =async (req, res) => {   

    const product = await collectionProduct.find({Category:"iphone",isDelete:true})
    const category =await collectionCat.find({isBlocked:false})
    console.log("category",category);
    res.render("user/product.ejs",{product,category})
   
};

const mac =async (req, res) => {

    const product = await collectionProduct.find({Category:"mac",isDelete:true})
    const category =await collectionCat.find({isBlocked:false})
    console.log("category",category);
    res.render("user/mac.ejs",{product,category}) 
  
};

const airpod =async (req, res) => {

    const product = await collectionProduct.find({Category:"airpods",isDelete:true})
    const category =await collectionCat.find({isBlocked:false})
    res.render("user/airpod.ejs",{product,category})
    // res.render('user/product.ejs', (err, html) => {
    //     if (err) {
    //         console.error(err.stack);
    //         res.status(500).send('Internal Server Error');
    //     } else {
    //         res.send(html);
    //     }
    // });
};


const watch =async (req, res) => {

    const product = await collectionProduct.find({Category:"watch",isDelete:true})
    const category =await collectionCat.find({isBlocked:false})
    res.render("user/watch.ejs",{product,category})
    
    // res.render('user/product.ejs', (err, html) => {
    //     if (err) {
    //         console.error(err.stack);
    //         res.status(500).send('Internal Server Error');
    //     } else {
    //         res.send(html);
    //     }
    // });
};



const details = async (req, res) => {
    
    const productid =req.params.id
    const category =await collectionCat.find({isBlocked:false})
    const product = await collectionProduct.find({_id:productid})
    res.render('user/details',{product,category});
};
module.exports={
    products,details,mac,airpod,watch,

}