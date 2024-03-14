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
const collectionCat = require('../../models/category')

//whish list 
const whishlistload = async (req, res) => {
    try {
        if (req.session.user) {
            const userEmail = req.session.user;
            const category =await collectionCat.find({isBlocked:false})
            const userDetails = await collectionModel.findOne({ email: userEmail });
            const name =  userDetails.name
            const productData = userDetails.wishlist;
            const cart = userDetails.cart.items;
            const cartCount = cart.length;
            const productId = productData.map(items => items.productId);
            const productDetails = await collectionProduct.find({ _id: { $in: productId } });
            const price = productDetails.originalprice - (productDetails.originalprice * productDetails.productOffer) / 100

            res.render('user/wishlist', { price, productDetails, cartCount,name,category})
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
        const message = error.message
        res.render('404-error', { error, message })

    }
}

const addingWhishList = async (req, res) => {
    console.log('hey i am the add wishlist');
    try {
        const productId = req.params.id;
        const userEmail = req.session.user;
        const userDetails = await collectionModel.findOne({ email: userEmail });
        const productExist = userDetails.wishlist.map(items => items.productId.toString() === productId);


        if (productExist.includes(true)) {
            return res.json("Already Exist");
        } else {
            const WhishList = {
                productId: productId
            }
            userDetails.wishlist.push(WhishList);
            await userDetails.save();
            return res.json('server got this....');
        }
    } catch (error) {
        console.log(error);
        const message = error.message
        res.render('404-error', { error, message })

    }
}

const WhishProductDelete = async (req, res) => {
    console.log('hello i am the wishlist delete');
    try {
        const productId = req.params.id;
        const userEmail = req.session.user;
        await collectionModel.findOneAndUpdate(
            { email: userEmail },
            { $pull: { wishlist: { productId: productId } } }
        );
        res.redirect("/wishlist");
    } catch (error) {
        console.log("whish deleting Error" + error)
        const message = error.message
        res.render('404-error', { error, message })

    }
}

module.exports={
    whishlistload,addingWhishList,WhishProductDelete,
}
