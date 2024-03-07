const { render } = require('ejs');
const { sendEmail,sendforgetpassword } = require('../middleware/nodeMailer');
const nodemailer = require('nodemailer');
const collectionModel = require('../models/userdb');

const collection =require('../models/userdb');
const collectionOtp = require('../models/otp');
const collectionProduct = require("../models/product"); 
const collectionOrder = require('../models/order');
const bcrypt = require("bcrypt");
const { product } = require('./admincontroller');
const Razorpay = require('razorpay');
const collectionCoupoun = require('../models/coupoun');
const BannerDB = require("../models/bannerdb")

const razorpay = new Razorpay({
    key_id:process.env.keyId,
    key_secret:process.env.keyName
  });





const landing = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        let product;

        if (searchQuery) {
            // Perform search if there's a search query
            product = await collectionProduct.find({
                $and: [
                    { isDelete: true },
                    { $or: [
                        { Productname: { $regex: searchQuery, $options: 'i' } },
                        { Category: { $regex: searchQuery, $options: 'i' } }
                    ]}
                ]
            });
        } else {
            // Otherwise, retrieve all products with isDelete:true
            product = await collectionProduct.find({ isDelete: true });
        }

        if (req.session.user) {
            console.log('landing page ', req.session.user);
            res.redirect("/home");
        } else {
            res.render("user/landing", { product, searchQuery });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


 const login= (req, res) => {
    console.log('req.session.user' ,req.session.user );
    if(req.session.user){
        res.redirect("/home")
    }
    else{

        res.render('user/login.ejs');
    }
};

const loginpost = async(req,res)=>{  

    console.log('login post ' , req.body)
    try {
        const check = await collectionModel.findOne({email:req.body.email}) 
            console.log('checkid', check);
        
        const data =  await bcrypt.compare(req.body.password,check.password)
        if(data){//auth for login

            req.session.user = check.email//session creation
            req.session.userid=check._id
            console.log('user login post',req.session.user);
                res.redirect("/home")
        }else{
            // res.send("Wrong Password")
            res.render('user/login.ejs',{mes:"Incorrect Password"})
        }
    }
    catch(error) {
        // res.send("Wrong Details")
        res.render('user/login.ejs',{mes:"Incorrect Email"})
    }
    // res.redirect("/home")
}

const signup= (req, res) => {

    if(req.session.userid){
        res.redirect("/home")
    }
    else{
        if(req.session.otpGerner){
            res.redirect("/otp")
        }
        
        res.render('user/signup.ejs');
    }

}; 

    const signuppost =async (req,res) =>{
        // console.log(req.body,"here int he sign out");
       
      
        const data ={
            name : req.body.name,
            email : req.body.email,
            password :req.body.password,
            repassword :req.body.repassword,
            phone:req.body.phone
        }
    
        const newdata = await bcrypt.hash(data.password,10)

        const datahash ={
            name : req.body.name,
            email : req.body.email,
            password :newdata,
            repassword :req.body.repassword,
            phone:req.body.phone
        }

        console.log(newdata)
        console.log("sign")


        const existinUser = await collectionModel.findOne({email:data.email})
        console.log("alredy exist user")
        // console.log(existinUser)
        
        const randome = Math.floor(Math.random()*90000) +10000;
        const newOtp = await collectionOtp.create({number: randome, email: data.email});

        if(existinUser){
            res.render("user/signup",{status:true,mes:"user all ready exists"})

        }
        else{
            await collectionModel.insertMany([datahash]);
            // data["otpNum"] = randome
            req.session.otpGerner = data;
            console.log(data)
            console.log("here in the signup true")
            sendEmail(randome,req.body.email)
    
            // res.redirect('user/otp')
            res.redirect('/otp')
        }
        
    }

const forget= async(req,res)=>{
    res.render("user/forgetemail",)
}


const forgetpost= async(req, res) => {
    const email = req.body.email;

    if (!validateEmail(email)) {
        return res.status(400).send('Invalid email address');
    }

    const resetToken = generateOtp();
    const otpDoc = await collectionOtp.create({
        email, 
        number: resetToken
    })


    sendforgetpassword(otpDoc._id,req.body.email)
        .then(() => {
            // res.send('Reset page sent to youril!');
            res.render("user/forgetemail")

        })
        .catch((error) => {
            console.error('Error sending reset email:', error);
            res.status(500).send('Failed to send reset page. Please try again later.');
        });
        // Validate email address
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(String(email).toLowerCase());
}

// Generate reset token
function generateResetToken() {
    return Math.random().toString(36).substr(2);
}

function generateOtp(){
    return Math.floor( Math.random() * 5000000)
}

// // Send reset email
// function sendResetEmail(email, token) {
//     // Configure Nodemailer
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: // Your Gmail address
//             pass: 'your_password' // Your Gmail password
//         }
//     });

//     // Email message
//     const mailOptions = {
//         from: 'your_email@gmail.com',
//         to: email,
//         subject: 'Password Reset',
//         text: `Click the following link to reset your password: http://example.com/reset-password/${token}`
//     };

//     // Send email
//     return transporter.sendMail(mailOptions);
// }

};



const forgetPassword=async(req,res)=>{
    console.log(req.params)
    const token = req.params.token
    const otpDoc = await collectionOtp.findById(token);
    if(!otpDoc) {
        res.status(402).send("Invalid token")
        return
    }
    res.render("user/forget",{email: otpDoc.email})
}


const resetPassword = async (req,res)=>{
    try {
        const {newPassword, confirmPassword } = req.body;
        const email = req.params.email


        // Find the user by ID
        const user = await collectionModel.findOne({email});
        console.log(user);

        // Verify current password
        // if (user.password !== currentPassword) {
        //     // return res.status(400).json({ error: ' current password' });
        // }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }
        console.log(newPassword)
        const newpass = await bcrypt.hash(newPassword,10)
        user.password = newpass;
        await user.save();
        res.redirect("/login")
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const otp=(req,res)=>{
    if(req.session.otpGerner){
        res.render('user/otp',{ error: null })
    }else{
        res.redirect("/login")
    }
    

}


const otppost = async (req, res) => {
    try {
        const num1 = req.body.num1 || '';
        const num2 = req.body.num2 || '';
        const num3 = req.body.num3 || '';
        const num4 = req.body.num4 || '';
        const num5 = req.body.num5 || '';

        // Check if any of the input fields are empty
        if (!num1 || !num2 || !num3 || !num4 || !num5) {
            return res.status(400).render('user/otp', { error: 'Please enter all the OTP digits' });
        }

        const isNumber = parseInt(num1 + num2 + num3 + num4 + num5);
        console.log(typeof(isNumber));
        const result = await collectionOtp.findOne({ number: isNumber });

        if (result) {
            console.log(req.session.otpGerner)
            req.session.user = req.session.otpGerner.email;
            delete req.session.otpGerner;
            return res.redirect("/home");
        } else {
            return res.status(400).render('user/otp', { error: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.log(error.message);
        const message = error.message;
        res.status(500).render('404-error', { error, message });
    }
};



//resend otp

const resendOtp = async(req,res)=>{
    //   otp generator
      
       try {
           let randomOTP = Math.floor(Math.random() * 9000) + 10000;
           console.log('This is your resend OTP:', randomOTP);
           let entrie = 0;
   
           // Save the random OTP number to the database
           const newUser = new collectionOtp({
            number: randomOTP,
            email: req.session.otpGerner.email // Assuming req.session.otpGerner.email holds the email
        });
   
           await newUser.save();
           console.log(req.session.otpGerner.email)
           sendEmail(randomOTP,req.session.otpGerner.email)
        //    res.render('user/otp', { error: null, user: req.session.userid, entrie: 0 });
        console.log("rtyuio");
        res.render('user/otp',{ error: null })

        } catch (error) {
           console.log("Error generating OTP:", error);
           res.status(500).send("OTP error");
       }
   
   
   }


// iphone
const products =async (req, res) => {   

    const product = await collectionProduct.find({Category:"iphone",isDelete:true})
    res.render("user/product.ejs",{product})
    // res.render('user/product.ejs', (err, html) => {
    //     if (err) {
    //         console.error(err.stack);
    //         res.status(500).send('Internal Server Error');
    //     } else {
    //         res.send(html);
    //     }
    // });
};

const mac =async (req, res) => {

    const product = await collectionProduct.find({Category:"mac",isDelete:true})
    res.render("user/mac.ejs",{product})
    // res.render('user/product.ejs', (err, html) => {
    //     if (err) {
    //         console.error(err.stack);
    //         res.status(500).send('Internal Server Error');
    //     } else {
    //         res.send(html);
    //     }
    // });
};

const airpod =async (req, res) => {

    const product = await collectionProduct.find({Category:"Airpod",isDelete:true})
    res.render("user/airpod.ejs",{product})
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

    const product = await collectionProduct.find({Category:"Watch",isDelete:true})
    res.render("user/watch.ejs",{product})
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
    const product = await collectionProduct.find({_id:productid})
    res.render('user/details',{product});
};

const home = async (req, res) => {
    console.log( req.url )
    try {
        const username = req.session.userid;
        const searchQuery = req.query.search || '';
        const categoryQuery = req.query.category || '';
        
        let productQuery = { isDelete: true };
        if(searchQuery) 
            productQuery.Productname = { $regex: searchQuery, $options: "i" }
        
        const banner = await BannerDB.find({ status: 'active' });
        // Fetch products based on the constructed query
        
        const product = await collectionProduct.find(productQuery);
        
        const user = await collectionModel.findOne({ _id: username });
        if (user) {
            res.render("user/home", { product, user: req.session.useremail, searchQuery, categoryQuery,banner });
        } else {
            res.redirect("/login");
        }

    } catch (error) {
        console.log("Error in the home route:", error.message);
        res.status(500).send('Internal Server Error');
    }
};

    //cart details


    const loadcart = async (req, res) => {
        try {
            const userEmail = req.session.user;
            console.log(userEmail); // Get the user's email from the session
            const user = await collectionModel.findOne({ email: userEmail }).populate('cart.items.productname');
            
            if (!user) {
                return res.status(404).render('error', { message: 'User not found' });
            }
    
            // Extract the cart items directly from the user object
            const cartItems = user.cart.items;
            const grantTotal = user.cart.grantTotal
            // Render the cart view with the fetched data
            res.render('user/cart', { user, cartItems , grantTotal});
        } catch (error) {
            console.error('Error loading cart:', error);
            res.status(500).render('error', { message: 'An error occurred while loading the cart.' });
        }
    };
    
    const Addcart = async (req, res) => {
        try {
            const id = req.params.id;
            const userEmail = req.session.user;
            const user = await collectionModel.findOne({ email: userEmail });
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const product = await collectionProduct.findById(id);
            
            if (!product) {
                // Handle the case where the product doesn't exist
                return res.status(404).json({ message: 'Product not found' });
            }
            
            const unitprice = product.Price;
    
            // Ensure unitprice is a valid number
            if (isNaN(unitprice) || unitprice <= 0) {
                // Handle the case where unitprice is not a valid number
                return res.status(400).json({ message: 'Invalid unit price' });
            }
    
            const cartItems = user.cart.items;
            const existingCartItemIndex = cartItems.findIndex(item => item.productname.toString() === id);
    
            if (existingCartItemIndex !== -1) {
                cartItems[existingCartItemIndex].quantity += 1;
    
                // Update totalprice only if unitprice is a valid number
                if (!isNaN(cartItems[existingCartItemIndex].quantity) && cartItems[existingCartItemIndex].quantity > 0) {
                    cartItems[existingCartItemIndex].totalprice = cartItems[existingCartItemIndex].quantity * unitprice;
                }
            } else {
                const newCartItem = {
                    productname: id,
                    quantity: 1,
                    totalprice: unitprice,
                };
                user.cart.items.push(newCartItem);
            }
            user.cart.grantTotal = user.cart.items.reduce((total , item) => total + item.totalprice, 0 )
            await user.save();
    
            const cartItemsCount = user.cart.items.length;
    
            // Return the updated user object or any other response as needed
            // return res.status(200).json({ message: 'Cart updated successfully', cartItemsCount });
        } catch (error) {
            console.error('Error from Addcart:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };

    const cartQuantityUpdate = async (req, res) => {
        try {
            const cartId = req.params.id;
            const quantity = req.body.quantity; 
            const userEmail = req.session.user;
            
            // Find the user details
            const userDetails = await collectionModel.findOne({ email: userEmail });
    
            // Find the cart item corresponding to the provided ID
            const cartItem = userDetails.cart.items.find(item => item.productname == cartId);
    
            // Find the product details from the product collection
            const product = await collectionProduct.findById(cartId);
    
            // Check if the product exists
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
    
            // Check if the requested quantity exceeds the available stock
            if (quantity > product.Stock) {
                // If quantity exceeds stock, return a client-side alert
                return res.status(400).json({ 
                    error: 'Requested quantity exceeds available stock', 
                    showAlert: true, 
                    alertMessage: 'The product is out of stock now.' 
                });
            }
    
            // Update the cart item quantity and total price
            cartItem.quantity = quantity;
            cartItem.totalprice = product.Price * quantity;
    
            // Recalculate grantTotal and total
            userDetails.cart.grantTotal = userDetails.cart.items.reduce((accu, element) => accu + element.totalprice, 0);
            // userDetails.total = userDetails.cart.items.reduce((accu, element) => accu + (element.quantity * element.Price), 0);
            const totalAmount = userDetails.cart.grantTotal;
    
            // Save the changes to the user details
            await userDetails.save();
    
            res.json({ grantTotal: userDetails.cart.grantTotal, totalAmount });
        } catch (error) {
            console.error('Error from the cartQuantityUpdate:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    
    
    // const cartDelete = async (req, res) => {
    //     try {
    //         // Get the item ID from the request parameters
    //         const deletecart = req.params.id;
    //         // Get the user's email from the session
    //         const userEmail = req.session.user;
    //         console.log("cart delets");
    //         console.log("useremail",userEmail)
    //         console.log("delete",deletecart)
    //         // Find and update the user's document in the database
    //         const updatedUser = await collectionModel.updateOne({email:userEmail}, {$pull : { 'cart.items': {productname:deletecart} }})

    //         console.log(updatedUser)
    //         // await usercollection.updateOne({ email: userEmail }, { $pull: { 'cart.items': { _id: id } } });
    //         if (!updatedUser) {
    //             throw new Error('User not found');
    //         }
    //         // Send a success response
    //         res.sendStatus(200);
    //     } catch (error) {
    //         console.error('Error from cartDelete:', error);
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // };
    const cartDelete = async (req, res) => {
        try {
            // Get the item ID from the request parameters
            const deletecart = req.params.id;
            // Get the user's email from the session
            const userEmail = req.session.user;
    
            // Find the user and remove the cart item
            const user = await collectionModel.findOneAndUpdate(
                { email: userEmail },
                { $pull: { 'cart.items': { productname: deletecart } } },
                { new: true }
            );
    
            if (!user) {
                throw new Error('User not found');
            }
    
            // Recalculate grantTotal
            user.cart.grantTotal = user.cart.items.reduce((total, item) => total + item.totalprice, 0);
            await user.save();
    
            // Send a success response
            res.sendStatus(200);
        } catch (error) {
            console.error('Error from cartDelete:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    
    


// checkout 
// const checkoutpage = async (req, res) => {
//     try {
//         // Retrieve user's email from session
//         const userId = req.session.userid;
        
//         // Fetch user details from the database
//         const userDetails = await collectionModel.findOne({ _id: userId });

//         // Extract necessary information from user details
//         const user = userDetails._id;
//         const cartItems = userDetails.cart.items;
//         const cartCount = cartItems.length;

//         // Extract product IDs from cart items
//         const cartProductIds = cartItems.map(item => item.productname);

//         // Fetch product details for items in the cart
//         const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds } });

//         // Calculate total price of all items in the cart
//         let totalPrice = 0;
//         const result = [];

//         for (let values of cartItems) {
//             for (let product of cartProducts) {
//                 if (String(values.productname).trim() === String(product._id).trim()) {
//                     result.push({
//                         name: product.Productname,
//                         price: product.Price
//                     });
//                     totalPrice += product.Price;
//                 }
//             }
//         }

//         // Fetch available coupons from the database
//         const coupons = await collectionCoupoun.find({});

//         // Render the checkout page with retrieved data
//         res.render('user/checkout', { user: userDetails, result, total: userDetails.cart.grantTotal, cartCount, coupons });

//     } catch (error) {
//         console.log(error);
//         const message = error.message;
//         res.render('404-error', { error, message });
//     }
// };


// const coupoun = async (req, res) => {
//     const { code } = req.params;
//     const userId = req.session.user;

//     try {
//         let cart = await collectionModel.findOne({ user: userId });

//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found" });
//         }

//         const coupon = await collectionCoupoun.findOne({ code });

//         if (!coupon) {
//             return res.status(404).json({ message: "Coupon not found" });
//         }

//         if (cart.couponused.discount_amount !== 0) {
//             return res.status(400).json({ message: "Coupon already applied" });
//         }

//         const couponAmount = (cart.totalPrice * coupon.discount) / 100;

//         // Calculate the new total price after applying the coupon discount
//         const newTotalPrice = cart.totalPrice - couponAmount;

//         // Update the cart with the coupon details and new total price
//         cart.totalPrice = newTotalPrice;
//         cart.couponused = {
//             couponid: coupon._id,
//             discount_amount: couponAmount,
//         };

//         // Save the updated cart
//         await cart.save();

//         res.json({ message: "Coupon applied successfully", cart });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// 
const checkoutpage = async (req, res) => {
    try {
        // Retrieve user's email from session
        const userId = req.session.userid;
        
        // Fetch user details from the database
        const userDetails = await collectionModel.findOne({ _id: userId });

        // Extract necessary information from user details
        const user = userDetails._id;
        const cartItems = userDetails.cart.items;
        const cartCount = cartItems.length;

        // Extract product IDs from cart items
        const cartProductIds = cartItems.map(item => item.productname);

        // Fetch product details for items in the cart
        const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds } });

        // Calculate total price of all items in the cart
        let totalPrice = 0;
        const result = [];

        for (let values of cartItems) {
            for (let product of cartProducts) {
                if (String(values.productname).trim() === String(product._id).trim()) {
                    result.push({
                        name: product.Productname,
                        price: product.Price
                    });
                    totalPrice += product.Price;
                }
            }
        }

        // Fetch available coupons from the database
        const coupons = await collectionCoupoun.find({});

        let checktotal = userDetails.cart.grantTotal

        const validCoupons = [];

         coupons.forEach(coupon => {
         if (coupon.couponValue < checktotal) {
        validCoupons.push(coupon);
       }
       });

console.log(validCoupons);

        

        



        // Render the checkout page with retrieved data
        res.render('user/checkout', { user: userDetails, result, total: userDetails.cart.grantTotal, cartCount, validCoupons });

    } catch (error) {
        console.log(error);
        const message = error.message;
        res.render('404-error', { error, message });
    }
};

const coupoun = async (req, res) => {
    const { code } = req.params;
    const userId = req.session.user;

    try {
        let cart = await collectionModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const coupon = await collectionCoupoun.findOne({ code });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        if (cart.couponused.discount_amount !== 0) {
            return res.status(400).json({ message: "Coupon already applied" });
        }

        // Calculate the coupon amount based on the cart total price and coupon discount
        const couponAmount =   coupon.discount
        // Check if the coupon amount is greater than 0 and the total price is greater than the coupon amount
        if (couponAmount > 0 && cart.totalPrice > couponAmount) {
            // Calculate the new total price after applying the coupon discount
            const newTotalPrice = cart.totalPrice - couponAmount;

            // Update the cart with the coupon details and new total price
            cart.totalPrice = newTotalPrice;
            cart.couponused = {
                couponid: coupon._id,
                discount_amount: couponAmount,
            };

            // Save the updated cart
            await cart.save();

            return res.json({ message: "Coupon applied successfully", cart });
        } else {
            // If the coupon amount is 0 or the total price is less than or equal to the coupon amount, do not apply the coupon
            return res.status(400).json({ message: "Coupon cannot be applied" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const orderSuccess = async (req,res)=>{


    console.log(req.body)
    const currentDate = new Date();

    const dataa = req.body
    const id = req.session.userid;
    const foundUser = await collectionModel.findOne({ _id:id });
    

    const cartItems = foundUser.cart.items;
    console.log(cartItems);
    console.log("addres",dataa);
    const cartProductIds = cartItems.map(item => item.productname);
    const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds }});
    console.log(cartProducts)

    const userId = foundUser._id;
    const addressId = dataa.selectedAddress;
    const method = dataa.method;
    const amount = foundUser.cart?.grantTotal;
    console.log(('hey man this your ordered amount'));
    console.log(amount)

    if(method === "wallet"){
        if (foundUser.walletbalance < amount) {
             res.status(400).json({ error: 'Insufficient wallet balance.' });

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
    

    
    // console.log(productData)

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


    console.log(method)
  
        console.log("hai")

        await newOrder.save();
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

// const walletSuccess = async (req,res)=>{


//     console.log(req.body)
//     const currentDate = new Date();

//     const dataa = req.body
//     const id = req.session.userid;
//     const foundUser = await collectionModel.findOne({ _id:id });

//     if(walletbalance==amount){

//     }
    

//     const cartItems = foundUser.cart.items;
//     console.log(cartItems);
//     console.log("addres",dataa);
//     const cartProductIds = cartItems.map(item => item.productname);
//     const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds }});
//     console.log(cartProducts)

//     const userId = foundUser._id;
//     const addressId = dataa.selectedAddress;
//     const method = dataa.method;
//     const amount = foundUser.cart?.grantTotal;
//     console.log(('hey man this your ordered amount'));
//     console.log(amount)
   
//     const productData = cartProducts.map(product => {
//         const cartItem = cartItems.find(item =>item.productname.toString() === product._id.toString());

//         return {
//             p_name: product.Productname,
//             realPrice: product.Price,
//             price: amount,
//             description: product.Description,
//             image: product.Image,
//             category: product.Category,
//             quantity:cartItem.quantity
//         }
//     });
//     // console.log(productData)

//     const deliveryDate = new Date();
//     deliveryDate.setDate(currentDate.getDate() + 5);
//     const newOrder = new collectionOrder({
//         userId: userId,
//         address: req.body.addressid,
//         products: productData,
//         payment: {
//             method: method,
//             amount: amount
//         },
//         status: "Processing",
//         proCartDetail: cartProducts,
//         cartProduct: cartItems,
//         createdAt: currentDate,
//         expectedDelivery: deliveryDate
//     });


//     console.log(method)
  
//         console.log("hai")

//         await newOrder.save();
//         for (let values of cartItems) {
//             for (let products of cartProducts) {
//                 if (new String(values.productname).trim() == new String(products._id).trim()) {
//                     products.Stock = products.Stock - values.quantity;
                    
//                     await products.save()
//                 }
//             }
//         }
//         foundUser.cart.items = [];
//         foundUser.grantTotal = 0;
//         foundUser.total = 0;
//         await foundUser.save();
//         res.status(200).json({data:"Ordered Successfully"})
// }
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
console.log(options);
    try{
        const order = await razorpay.orders.create(options);
        res.json({orderId:order.id});
    }
    catch(error){
    console.error('error creating order');
        res.status(500).send('Internal servr error')
    }

}

const addressAdding=(req,res)=>{
    res.render("user/newaddresscheckout")
}

const addressAddingpost = async (req, res) => {
    const { name, houseName, city, phone, postalCode} = req.body;
    const userId = req.session.user; // Assuming you have a session userId
    console.log(userId);
    try {
        // Assuming you have a model for your collection
        const user = await collectionModel.findOne({ email : userId});

        // Create a new address object
        const newAddress = {
            name: name,
            houseName: houseName,
            city: city,
            phone: phone,
            postalCode: postalCode,
            emailid: userId 
        };
        console.log(user);
        // Push the new address object into the addresses array
        user.profile.address.push(newAddress);

        // Save the updated user document
        await user.save();

        // res.status(200).send("Address added successfully");
        // res.render('user/manageAddress',{ user});
        res.redirect("/CheckOutPage")

    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).send("Internal Server Error");
    }
};




// // profile
// const profile = async(req,res)=>{
//     try {
//         if(req.session.user){
//         console.log('i am profile')
//         console.log(req.session.user)
//         console.log(req.session.userid)
//         const userData = await collectionModel.findOne({ _id: req.session.userid});
//         // let cart = userDetails.cart.items;
//         // let cartCount = cart.length;
//         console.log(userData);
//         const name = userData.profile.address;

//         const user = true
//         // const FoundUser = req.session.user;
//         // const userData = await collectionModel.findOne({ email: FoundUser });
//         res.render('user/profile', { user,userData,name});
//         }else{
//             res.redirect('/')
//         }
//     } catch (error) {
//         console.log(error)
//     }
// }


// const updateprofile = async (req, res) => {
//     console.log('i am the profile update');
//     try {
//         const userEmail = req.session.user;
//         const userData = await collectionModel.findOne({ email: userEmail });
//         let cart = userData.cart.items;
//         let cartCount = cart.length;
//         const { name, houseName, emailid, phone, postalCode, city } = req.body; // Updated field names
//         console.log(req.body)
//         console.log(typeof phone);


//         // If the user doesn't have any address, insert new details
//         if (!userData.profile.address || userData.profile.address.length === 0) {
//             userData.profile.address.push({ 
//                 name:name,
//                 houseName: houseName,
//                 postalCode: postalCode,
//                 city: city,
//                 emailid:emailid,
//                 phone:phone,
        
//             });
//         }

//         userData.name = name;
//         userData.email = emailid;
//         userData.phone = phone;

//         await userData.save();

//         req.session.email = userData.email;
        
//         return res.redirect('/profile');
//     } catch (error) {
//         console.log(error.message);
//         return res.status(500).render('404-error', { error: error.message });
//     }
// }

// const manageAddress= async(req,res)=>{
//     const email = req.session.user;

//         const { firstname,address, city, phone, postalCode } = req.body;
// console.log(email +"email");
//         const userData = await collectionModel.findOne({ email: email });
//     console.log(userData+"userData")
//     res.render('user/addressManage.ejs',{userData})
// }


// const addAddress = async(req,res)=>{
//     try {
//         if(req.session.user){
//         console.log('i am profile')
//         const userDetails = await collectionModel.findOne({ email: req.session.user });
//         let cart = userDetails.cart.items;
//         let cartCount = cart.length;
//         const name = userDetails.profile.address;

//         const user = true
//         const FoundUser = req.session.user;
//         const userData = await collectionModel.findOne({ email: FoundUser });
//         res.render('user/addAddress', { user,userData, cartCount ,name});
//         }else{
//             res.redirect('/')
//         }
//     } catch (error) {
//         console.log(error)
//     }
// }

// const addAddresspost = async (req, res) => {
//     const { name, houseName, city, phone, postalCode} = req.body;
//     const userId = req.session.user; // Assuming you have a session userId
//     console.log(userId);
//     try {
//         // Assuming you have a model for your collection
//         const user = await collectionModel.findOne({ email : userId});

//         const phone =parseInt(phone)

//         // Create a new address object
//         const newAddress = {
//             name: name,
//             houseName: houseName,
//             city: city,
//             phone: phone,
//             postalCode: postalCode,
//             emailid: userId 
//         };
//         console.log(user);
//         // Push the new address object into the addresses array
//         user.profile.address.push(newAddress);

//         // Save the updated user document
//         await user.save();

//         // res.status(200).send("Address added successfully");
//         // res.render('user/manageAddress',{ user});
//         res.redirect("/manageAddress")

//     } catch (error) {
//         console.error("Error adding address:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };

// const editAddress = async (req, res) => {
//     try {
//         const email = req.session.user;
//         const addressId = req.params.id; // Extract the address ID from request parameters
//         const userData = await collectionModel.findOne({ email: email });
        
//         // Find the address based on the address ID
//         const address = userData.profile.address.find(addr => addr._id.toString() === addressId);
//         if (!address) {
//             return res.status(404).render('error', { message: "Address not found" });
//         }
        
//         res.render("user/editAddress", { userData, address }); // Pass the address to the template
//     } catch (error) {
//         console.error("Error fetching user data:", error);
//         return res.status(500).render('error', { message: "Error fetching user data" });
//     }
// }

// const editAddresspost = async (req, res) => {
//     try {
//         const { name, houseName, phone, postalCode, city, addressId } = req.body;
//         const userEmail = req.session.user;
        
//         // Find the user by email
//         const userData = await collectionModel.findOne({ email: userEmail });

//         // Find the index of the address to be updated
//         const addressIndex = userData.profile.address.findIndex(addr => addr._id.toString() === addressId);
//         if (addressIndex === -1) {
//             return res.status(404).send("Address not found");
//         }

//         // Update the address details
//         userData.profile.address[addressIndex].name = name;
//         userData.profile.address[addressIndex].houseName = houseName;
//         userData.profile.address[addressIndex].phone = phone;
//         userData.profile.address[addressIndex].postalCode = postalCode;
//         userData.profile.address[addressIndex].city = city;

//         // Save the updated user data
//         await userData.save();

//         // Redirect to the manageAddress page
//         return res.redirect('/manageAddress');
//     } catch (error) {
//         console.error("Error editing address:", error);
//         return res.status(500).render('error', { message: "Error editing address" });
//     }
// }


// const deleteAddress = async (req, res) => {
//     try {
//         const addressId = req.params.id;
//         const userEmail = req.session.user;
        
        
//         // Find the user by email
//         // const userData = await collectionModel.findOne({ email: userEmail });
//         const user = await collectionModel.findOne({ email: userEmail });
        
//         // Check if user exists
//         if (!user) {
//             return res.status(404).send("User not found");
//         }

//         // Find the index of the address to be deleted
//         const addressIndex = user.profile.address.findIndex(addr => addr._id.toString() === addressId);
//         if (addressIndex === -1) {
//             return res.status(404).send("Address not found");
//         }

//         // Remove the address from the array
//         user.profile.address.splice(addressIndex, 1);
        
//         // Save the updated user document
//         await user.save();

//         // Redirect to the manageAddress page
//         res.redirect('/manageAddress');
//     } catch (error) {
//         console.error("Error deleting address:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };

  



const logout =(req,res)=>{
    
    req.session.destroy((err) => {
        console.log("req.session logout" , req.session);
        if (err) {
            console.error('Error destroying session:', err);
        }
    });
    res.redirect("/login");
}


// // order
// const order=async(req,res)=>{
//     try {
//         // Fetch orders from the database, you'll need to replace this with your actual logic
//         const orders = await collectionOrder.find({ userId: req.session.userid });
//         // Render the "user/order" view and pass the orders data
//         // console.log(orders[0].product,"here")
//         let listItems = [];
//         for(let order of orders){
//             listItems.push(order.products)
//         }
//         // console.log(orders);
//         res.render('user/order', { orders,listItems });
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         res.status(500).send('Internal Server Error');
//     }
    
// }
// const cancelOrder = async (req, res) => {
    
//     const {orderId,productId} =  req.params
//     // console.log("here");
//     // console.log(orderId);
//     // console.log(productId);
//     try {
//         // Find the order in the database
//         const user=await collectionModel.findOne({_id:req.session.userid})
//         // const wallet=user.wallethistory
//         console.log("look at yoou",req.session.userid);
//         // const walletbal = user.walletbalance
//         const order = await collectionOrder.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message:"Order not found"});
//         }
//         console.log("order",order);
//         // const itemcancel= order.products.find(items => items._id.toString()===itemId)
//         const productToCancel = order.products.find(products => products.p_id.toString() === productId);
//         console.log(order.payment,"PATTTT");
//         console.log(order.payment.amount,"fffffff");

//         if(order.payment.method !="cashondelivery"){
//             await collectionModel.updateOne({_id:req.session.userid},{$inc:{walletbalance:order.payment.amount}})

//             user.wallethistory.push({
//                 process:order.payment.method,
//                 amount:productToCancel.quantity * productToCancel.realPrice,
//             })
           
//             await user.save()
//         }

//         if (!productToCancel) {
//             // console.log("here is out here")
//             return res.status(404).json({ message: "Product not found in the order" });
//         }
//         // Update the order status to "Cancelled"
        
//         // itemcancel.status = "Cancelled";
//         productToCancel.status = "Cancelled";

//         await order.save();

//         res.status(200).json({ message: "Order cancelled successfully", order });
//     } catch (error) {
//         console.error('Error cancelling order:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };


// const orderReturn= async (req, res, next) => {
//     try {
//         const {orderId, productId, reason} = req.body;

//         const productData = await collectionOrder.findById(orderId);
//         productData.products.forEach(item => {
//             if (item.p_id === productId) {
//                 item.status = "Return Request";
//                 item.reason = reason;
//             }
//         });
//         await productData.save();
//         res.json({success: true, message: 'Product returned successfully.'});
//     } catch (error) {
//         next(error); // Pass the error to the error handling middleware
//     }
// };

// wallet
const wallet = async (req, res) => {
    try {
        // Fetch user wallet details including wallethistory
        console.log("session user" ,req.session.userid)
        const user = await collectionModel.findById(req.session.userid);
        console.log('user' , user)
        res.render("user/wallet", { wallethistory: user.wallethistory , walletbalance:user.walletbalance});
    } catch (error) {
        console.error('Error fetching wallet details:', error);
        // Handle error appropriately
        res.status(500).send('Internal server error');
    }
}



//whish list 
const whishlistload = async (req, res) => {
    try {
        if (req.session.user) {
            const userEmail = req.session.user;
            const userDetails = await collectionModel.findOne({ email: userEmail });
            const name =  userDetails.name
            const productData = userDetails.wishlist;
            const cart = userDetails.cart.items;
            const cartCount = cart.length;
            const productId = productData.map(items => items.productId);
            const productDetails = await collectionProduct.find({ _id: { $in: productId } });
            const price = productDetails.originalprice - (productDetails.originalprice * productDetails.productOffer) / 100

            res.render('user/wishlist', { price, productDetails, cartCount,name })
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

// success
const success=(req,res)=>{
    res.render("user/succes")
}




module.exports={
    login,loginpost,signuppost,home,logout,signup,otp,otppost,resendOtp,forget,forgetpost,forgetPassword,resetPassword,
    products,details,landing,mac,airpod,watch,loadcart,cartDelete,Addcart,cartQuantityUpdate,
    checkoutpage,addressAdding,addressAddingpost,whishlistload,addingWhishList,WhishProductDelete,
    orderSuccess,walletSuccess,razor, coupoun,success,wallet
}
