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

const razorpay = new Razorpay({
    key_id:process.env.keyId,
    key_secret:process.env.keyName
  });


// checkout 
const checkoutpage = async (req, res) => {
    try {
        const userId = req.session.userid;
        const category = await collectionCat.find({ isBlocked: false })

        const userDetails = await collectionModel.findOne({ _id: userId });
        console.log(userDetails, "user details from checkout")
        const user = userDetails._id;
        const cartItems = userDetails.cart.items;
        const cartCount = cartItems.length;

        const cartProductIds = cartItems.map(item => item.productname);

        const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds } });
        console.log(cartProducts, "from cartProducts")

        let totalPrice = 0;
        const result = [];
        const deliveryCharge = 10;

        for (let values of cartItems) {
            for (let product of cartProducts) {
                if (String(values.productname).trim() === String(product._id).trim()) {
                    result.push({
                        name: product.Productname,
                        price: product.OriginalPrice
                    });
                    totalPrice += product.OriginalPrice; // Use OriginalPrice instead of Price
                }
            }
        }

        // Add delivery charge to the total price
        totalPrice += deliveryCharge;

        const coupons = await collectionCoupoun.find({});
        let checktotal = userDetails.cart.grantTotal + 10;
        const validCoupons = [];
        console.log(result, "REsult from checkout ")
        coupons.forEach(coupon => {
            if (coupon.couponValue < checktotal) {
                validCoupons.push(coupon);
            }
        });

        res.render('user/checkout', { 
            user: userDetails, 
            result, 
            total: checktotal, // Pass totalPrice instead of userDetails.cart.grantTotal
            cartCount, 
            validCoupons, 
            category,
            deliveryCharge // Pass deliveryCharge to the EJS template
        });

    } catch (error) {
        console.log(error);
        const message = error.message;
        res.render('404-error', { error, message });
    }
};

const productCheckout = async (req, res) => {
    try {
        const userId = req.session.userid;
        const category = await collectionCat.find({ isBlocked: false });

        const userDetails = await collectionModel.findOne({ _id: userId });

        const user = userDetails._id;

        const productId = req.query.productId;

        const product = await collectionProduct.findById(productId);

        let totalPrice = 0;
        const result = [{
            name: product.Productname,
            price: product.OriginalPrice
        }];

        const deliveryCharge = 10; // Define the delivery charge here

        const coupons = await collectionCoupoun.find({});

        let checktotal = userDetails.cart.grantTotal;

        const validCoupons = [];

        coupons.forEach(coupon => {
            if (coupon.couponValue < checktotal) {
                validCoupons.push(coupon);
            }
        });

        // Calculate the total price including the product price and delivery charge
        totalPrice = result[0].price + deliveryCharge;

        res.render('user/checkout', { 
            user: userDetails, 
            result, 
            total: totalPrice, // Pass the total price including delivery charge
            cartCount: 1, 
            validCoupons, 
            category, 
            deliveryCharge // Pass the delivery charge to the EJS template
        });

    } catch (error) {
        console.log(error);
        const message = error.message;
        res.render('404-error', { error, message });
    }
};

const coupoun = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userid;

    try {
        let user = await collectionModel.findById(userId);
        console.log(user);

        let cart = user.cart
        cart.grantTotal = cart.items.reduce((total , item) => total + item.totalprice, 0 )
       
        console.log(cart);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const coupon = await collectionCoupoun.findById(id);
         console.log(coupon);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

       

        const couponAmount =   coupon.couponValue
        if (couponAmount > 0 && cart.grantTotal > couponAmount) {
            const newTotalPrice = cart.grantTotal - couponAmount;

            cart.grantTotal = newTotalPrice;

            await user.save();
            console.log(user);
            return res.json({ message: "Coupon applied successfully", cart });
        } else {
            return res.status(400).json({ message: "Coupon cannot be applied" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const orderSuccess = async (req,res)=>{
    const currentDate = new Date();
    const dataa = req.body
    const id = req.session.userid;
    const foundUser = await collectionModel.findOne({ _id:id });

    const cartItems = foundUser.cart.items;
    const cartProductIds = cartItems.map(item => item.productname);
    const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds }});
    console.log(cartProductIds, cartProducts)

    const paymentstatus = dataa.paymentstatus
    const paymentStatus =  paymentstatus || "confirmed"
    const userId = foundUser._id;
    const addressId = dataa.selectedAddress;
    const method = dataa.method;
    const amount = foundUser.cart?.grantTotal;
    console.log(('hey man this your ordered amount'));
    console.log(amount)

    if(method.mode === "wallet"){
        if (foundUser.walletbalance < amount) {
             return res.status(400).json({ error: 'Insufficient wallet balance.' });

        }
        
        foundUser.walletbalance =  foundUser.walletbalance - amount;
        console.log("jj",foundUser.walletbalance)
        foundUser.wallethistory.push({
            process:"purchase",
            amount: amount
        })
    }
   
    const productData = cartProducts.map(product => {
        const cartItem = cartItems.find(item =>item.productname.toString() === product._id.toString());

        return {
            p_name: product.Productname,
            realPrice: product.Price,
            price: amount,
            description: product.Description,
            image: product.Image,
            category: product.Category,
            quantity:cartItem.quantity,
            p_id:product._id
        }
    });

    const deliveryDate = new Date();
    deliveryDate.setDate(currentDate.getDate() + 5);
    const newOrder = new collectionOrder({
        userId: userId,
        address: req.body.addressid,
        products: productData,
        payment: {
            method: method,
            totalAmount: amount
        },
        status: "Processing",
        proCartDetail: cartProducts,
        paymentstatus:paymentStatus,
        cartProduct: cartItems,
        createdAt: currentDate,
        expectedDelivery: deliveryDate
    });


    console.log(method)
  
    
    await newOrder.save();
    console.log(newOrder)
        for (let values of cartItems) {
            for (let products of cartProducts) {
                if (new String(values.productname).trim() == new String(products._id).trim()) {
                    products.Stock = products.Stock - values.quantity;
                    
                    await products.save()
                }
            }
        }
        foundUser.cart.items = [];
        foundUser.grantTotal = 0;
        foundUser.total = 0;
        await foundUser.save();
        res.status(200).json({data:"Ordered Successfully"})
        // res.redirect('/success')

}


const walletSuccess = async (req, res) => {
    console.log(req.body);
    const currentDate = new Date();
    const dataa = req.body;
    const id = req.session.userid;
    
    try {
        const foundUser = await collectionModel.findOne({ _id: id });
        const walletBalance = foundUser.walletbalance; // Assuming walletBalance is the property name
        
        // Calculate the total amount of the order
        const orderTotal = foundUser.cart?.grantTotal;
        
        // Check if the wallet balance is sufficient
        if (walletBalance < orderTotal) {
            return res.status(400).json({ error: 'Insufficient wallet balance.' });
            alert('Insufficient wallet balance.');

        }
        
        foundUser.walletbalance =  orderTotal-foundUser.walletbalance;
        console.log(foundUser.walletbalance)
        foundUser.wallethistory.push({
            process:"purchase",
            amount: orderTotal
        })

        // Proceed with order processing
        const cartItems = foundUser.cart.items;
        const cartProductIds = cartItems.map(item => item.productname);
        const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds }});
        const userId = foundUser._id;
        const addressId = dataa.selectedAddress;
        const method = dataa.method;
        const amount = orderTotal;

      
        const productData = cartProducts.map(product => {
            const cartItem = cartItems.find(item => item.productname.toString() === product._id.toString());
            
            return {
                p_name: product.Productname,
                realPrice: product.Price,
                price: amount,
                description: product.Description,
                image: product.Image,
                category: product.Category,
                quantity: cartItem.quantity
            };
        });
        
        const deliveryDate = new Date();
        deliveryDate.setDate(currentDate.getDate() + 5);
        
        const newOrder = new collectionOrder({
            userId: userId,
            address: req.body.addressid,
            products: productData,
            payment: {
                method: method,
                amount: amount
            },
            status: "Processing",
            proCartDetail: cartProducts,
            cartProduct: cartItems,
            createdAt: currentDate,
            expectedDelivery: deliveryDate
        });
        
        await newOrder.save();
        
        for (let values of cartItems) {
            for (let products of cartProducts) {
                if (String(values.productname).trim() === String(products._id).trim()) {
                    products.Stock -= values.quantity;
                    await products.save();
                }
            }
        }
        
        foundUser.cart.items = [];
        foundUser.grantTotal = 0;
        foundUser.total = 0;
        await foundUser.save();
        
        res.status(200).json({ data: "Ordered Successfully" });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const razor=async(req,res)=>{
    const {amount,currency}=req.body

    const options={
        amount,currency
    };
console.log("options",options);
    try{
        const order = await razorpay.orders.create(options);
        res.json({orderId:order.id});
    }
    catch(error){
    console.error('error creating order');
        res.status(500).send('Internal servr error')
    }

}

const addressAdding= async(req,res)=>{
    const category =await collectionCat.find({isBlocked:false})
    res.render("user/newaddresscheckout",{category})
}

const addressAddingpost = async (req, res) => {
    const { name, houseName, city, phone, postalCode} = req.body;
    const userId = req.session.user; // Assuming you have a session userId
    console.log(userId);
    try {
        const user = await collectionModel.findOne({ email : userId});

        const newAddress = {
            name: name,
            houseName: houseName,
            city: city,
            phone: phone,
            postalCode: postalCode,
            emailid: userId 
        };
        console.log(user);
        user.profile.address.push(newAddress);
        await user.save();

        res.redirect("/CheckOutPage")

    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).send("Internal Server Error");
    }
};


// wallet
const wallet = async (req, res) => {
    try {
        console.log("session user" ,req.session.userid)
        const category =await collectionCat.find({isBlocked:false})
        const user = await collectionModel.findById(req.session.userid);
        console.log('user' , user)
        res.render("user/wallet", { wallethistory: user.wallethistory , walletbalance:user.walletbalance,category});
    } catch (error) {
        console.error('Error fetching wallet details:', error);
        // Handle error appropriately
        res.status(500).send('Internal server error');
    }
}
//refferal
const refferal= async (req,res)=>{
    console.log("session user" ,req.session.userid)
        const category =await collectionCat.find({isBlocked:false})
        const user = await collectionModel.findById(req.session.userid);
        res.render("user/referal",{user,category})
} 

// failed pay
const failedpay = async (req, res) => {
    const { Id } = req.body;
    try {
        const order = await collectionOrder.findById(Id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentstatus = 'confirmed';

        await order.save();

        return res.status(200).json({ message: 'Retrying Payment Successful' });

    } catch (error) {
        console.error('Error during finding the order:', error);
        res.status(500).send('Internal Server Error');
    }
};


// success
const success= async(req,res)=>{
    const category =await collectionCat.find({isBlocked:false})

    res.render("user/succes",{category})
}


module.exports={
     checkoutpage,addressAdding,addressAddingpost,
    orderSuccess,walletSuccess,razor, coupoun,success,wallet,failedpay, productCheckout,refferal
}
