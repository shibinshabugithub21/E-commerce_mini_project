const { render } = require('ejs');
const { sendEmail } = require('../middleware/nodeMailer');
const collectionModel = require('../models/mongodb');

const collection =require('../models/mongodb');
const collectionOtp = require('../models/otp');
const collectionProduct = require("../models/product"); 
const collectionOrder = require('../models/order');



const landing= async(req,res)=>{
    
    const product = await collectionProduct.find({isDelete:true})
    if(req.session.user){
        console.log('landing page ',req.session.user);
        res.redirect("/home")
    }
    else{
    //  sendEmail("12345")
    res.render("user/landing",{product})
    }
    // res.render('user/landing.ejs')
}


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
        if(check.password === req.body.password){//auth for login

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
    
        console.log("sign")


        const existinUser = await collectionModel.findOne({email:data.email})
        console.log("alredy exist user")
        // console.log(existinUser)
        
        const randome = Math.floor(Math.random()*90000) +10000;
        const newOtp = await collectionOtp.create({number:randome})

        if(existinUser){
            res.render("user/signup",{status:true,mes:"user all ready exists"})

        }
        else{
            await collectionModel.insertMany([data]);
            // data["otpNum"] = randome
            req.session.otpGerner = data;
            console.log(data)
            console.log("here in the signup true")
            sendEmail(randome,req.body.email)
    
            // res.redirect('user/otp')
            res.redirect('/otp')
        }
        
    }

const forget= (req, res) => {
        res.render("user/forget")
    
    
};



const otp=(req,res)=>{
    if(req.session.otpGerner){
        res.render('user/otp')
    }else{
        res.redirect("/login")
    }
    

}

const otppost = async (req, res) => {
    try {
      
        console.log(req.body)
        const isNumber = req.body.num1 * 10000 + req.body.num2 * 1000 + req.body.num3 * 100 + req.body.num4 * 10 + req.body.num5 * 1;
        console.log(typeof(isNumber));
        const result = await collectionOtp.findOne({ number: isNumber });
        console.log(result);
        if(result){
            req.session.user  = req.session.otpGerner.email;
            delete req.session.otpGerner;
            res.redirect("/home")
        }else{
            res.redirect("/login")
        }

            // .then((found) => {
            //     if (found.length > 0) {
            //         // Your logic for a successful OTP verification
            //     } else {
            //         res.render('user/otp', { fal: "Please Check Your OTP", user: req.session.user, cartCount })
            //     }
            // })
            // .catch((err) => {
            //     res.render('user/otp', { fal: "Please Check Your OTP", user: req.session.user, cartCount })
            // })
            
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Otp error")
        const message = error.message
        res.status(500).render('404-error', { error, message })
    }
}


//resend otp

const resendOtp = async(req,res)=>{
    //   otp generator
      
       try {
           let randomOTP = Math.floor(Math.random() * 9000) + 10000;
           console.log('This is your resend OTP:', randomOTP);
           let entrie = 0;
   
           // Save the random OTP number to the database
           const newUser = new collectionOtp({
               number: randomOTP
           });
   
           await newUser.save();
   
           res.render('user/otp', { user: req.session.user, entrie });
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

const home =async (req,res)=>{
    try {
        const username = req.session.userid
        const product = await collectionProduct.find({isDelete:true})
        console.log(username,"here in the home");
    // res.render("user/home",{product})
       // console.log("here in the ")
       const user = await collectionModel.findOne({_id: username})
       console.log(user)
       if(user){
        console.log("hwee");

           res.render("user/home", {product,user:req.session.useremail})
       }
    else{
           res.redirect("/login");
       } 
    } catch (error) {
       console.log("error in the home",error.message)
    }
   // if(req.session.user){
   //     res.render("user/home", {user:req.session.user})
   // }
   // else{
   //     res.render("user/login")
   // }
}

  
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

    // const cartQuantityUpdate = async (req, res) => {
    //     try {
    //         const cartId = req.params.id;
    //         console.log(cartId);
    //         const quantity = req.body.quantity; 
    //         const userEmail = req.session.user;
            
          
    //         const userDetails = await collectionModel.findOne({ email: userEmail });
    //         console.log(userDetails);
    //         // const cartItem = userDetails.cart.items.id(cartId);
    //         const cartItem = userDetails.cart.items.find(item => item.productname == cartId);

    //         console.log(cartItem);
    //         const product = await collectionProduct.findById(cartId);
            
    //         cartItem.quantity = quantity;
    
    //         const totalPrice = product.Price * quantity;
    //         cartItem.totalprice = totalPrice;
    
    //         userDetails.cart.grantTotal = userDetails.cart.items.reduce((accu, element) => accu + element.totalprice, 0);
    //         userDetails.total = userDetails.cart.items.reduce((accu, element) => accu + (element.quantity * element.Price), 0);
        
    
    //         await userDetails.save();
    
    //         res.json({ grantTotal: userDetails.grantTotal, total: userDetails.total });
    //     } catch (error) {
    //         console.error('Error from the cartQuantityUpdate:', error);
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // };
    
    const cartQuantityUpdate = async (req, res) => {
        try {
            const cartId = req.params.id;
            const quantity = req.body.quantity; 
            const userEmail = req.session.user;
            
            const userDetails = await collectionModel.findOne({ email: userEmail });
            const cartItem = userDetails.cart.items.find(item => item.productname == cartId);
            const product = await collectionProduct.findById(cartId);
            
            cartItem.quantity = quantity;
            cartItem.totalprice = product.Price * quantity;
    
            userDetails.cart.grantTotal = userDetails.cart.items.reduce((accu, element) => accu + element.totalprice, 0);
            userDetails.total = userDetails.cart.items.reduce((accu, element) => accu + (element.quantity * element.Price), 0);
    
            await userDetails.save();
    
            res.json({ grantTotal: userDetails.cart.grantTotal, total: userDetails.total });
        } catch (error) {
            console.error('Error from the cartQuantityUpdate:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    
    const cartDelete = async (req, res) => {
        try {
            // Get the item ID from the request parameters
            const deletecart = req.params.id;
            // Get the user's email from the session
            const userEmail = req.session.user;
            console.log("cart delets");
            console.log(userEmail)
            console.log(deletecart)
            // Find and update the user's document in the database
            const updatedUser = await collectionModel.updateOne({email:userEmail}, {$pull : { 'cart.items': {productname:deletecart} }})

            console.log(updatedUser)
            // await usercollection.updateOne({ email: userEmail }, { $pull: { 'cart.items': { _id: id } } });
            if (!updatedUser) {
                throw new Error('User not found');
            }
            // Send a success response
            res.sendStatus(200);
        } catch (error) {
            console.error('Error from cartDelete:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    
    
    
   // checkout 
   const checkoutpage = async (req, res) => {
    try {
        // Retrieve user's email from session
        const userId = req.session.userid;
        
        // Fetch user details from the database
        const userDetails = await collectionModel.findOne({ _id:userId});

        // Extract necessary information from user details
        const user= userDetails._id;
        const cartItems = userDetails.cart.items;
        const cartCount = cartItems.length;

        // Extract product IDs from cart items
        const cartProductIds = cartItems.map(item => item.productname);

        // Fetch product details for items in the cart
        const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds } });

        // Calculate total price of all items in the cart
        // const totalPrice = cartItems.reduce((accu, element) => accu + (element.quantity * element.price), 0);

        let result = [];

        for (let values of cartItems){
            for(let product of cartProducts){

                if (String(values.productname).trim() === String(product._id).trim()) {

                    result.push({
                        name:product.Productname,
                        price:product.Price
                    })
                }
            }
        }
        console.log(result)
        // Render the checkout page with retrieved data
        res.render('user/checkout', { user: userDetails,result,total:userDetails.cart.grantTotal,cartCount });

    } catch (error) {
        console.log(error);
        const message = error.message;
        res.render('404-error', { error, message });
    }
};


const orderSuccess = async (req,res)=>{
    console.log(req.body)
    const currentDate = new Date();

    const data = req.body
    const id = req.session.userid;
    const foundUser = await collectionModel.findOne({ _id:id });
    // console.log(foundUser);
    const cartItems = foundUser.cart.items;
    console.log(cartItems);
    const cartProductIds = cartItems.map(item => item.productname);
    const cartProducts = await collectionProduct.find({ _id: { $in: cartProductIds }});
    console.log(cartProducts)

    const userId = foundUser._id;
    const addressId = data.selectedAddress;
    const method = data.method;
    const amount = foundUser.cart?.grantTotal;
    console.log(('hey man this your ordered amount'));
    console.log(amount)
    // Data collecting for db Storing
    const productData = cartProducts.map(product => ({
        p_name: product.Productname,
        realPrice: product.Price,
        price: amount,
        description: product.Description,
        image: product.Image,
        category: product.Category,
        quantity: product.quantity
    }));
    console.log(productData)

    const deliveryDate = new Date();
    deliveryDate.setDate(currentDate.getDate() + 5);
    const newOrder = new collectionOrder({
        userId: userId,
        address: addressId,
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
    if (method === "COD") {
        console.log("hai")

        await newOrder.save();
        for (let values of cartItems) {
            for (let products of cartProducts) {
                if (new String(values.productId).trim() == new String(products._id).trim()) {
                    products.quantity = products.quantity - values.quantity;
                    
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

    }  else {
        res.status(400).send("individual payment")
    }

}

const addressAdding=(req,res)=>{
    res.render("user/newaddresscheckout")
}

const addressAddingpost = async (req, res) => {
    console.log('hey i am address adding function ');
    try {

        const email = req.session.user;
        const { firstname,address, city, phone, postalCode } = req.body;
console.log(email);
        const userData = await collectionModel.findOne({ email: email });

        if (!userData) {
            return console.log("User not found")
        }

        const newAddress = {
            name: firstname,
            houseName: address,
            city: city,
            phone: phone,
            postalCode: postalCode,
            
        };

        userData.profile.address.push({newAddress});
        await userData.save();
        res.render('user/checkout', { user: userDetails });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
        const message = error.message
        res.render('404-error', { error, message })

    }
};




// profile
const profile = async(req,res)=>{
    try {
        if(req.session.user){
        console.log('i am profile')
        const userDetails = await collectionModel.findOne({ email: req.session.user });
        let cart = userDetails.cart.items;
        let cartCount = cart.length;
        const name = userDetails.profile.address;

        const user = true
        const FoundUser = req.session.user;
        const userData = await collectionModel.findOne({ email: FoundUser });
        res.render('user/profile', { user,userData, cartCount ,name});
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
    }
}


const updateprofile = async (req, res) => {
    console.log('i am the profile update');
    try {
        const userEmail = req.session.user;
        const userData = await collectionModel.findOne({ email: userEmail });
        let cart = userData.cart.items;
        let cartCount = cart.length;
        const { name, houseName, emailid, phone, postalCode, city } = req.body; // Updated field names

        // If the user doesn't have any address, insert new details
        if (!userData.profile.address || userData.profile.address.length === 0) {
            userData.profile.address.push({
                name:name,
                houseName: houseName,
                postalCode: postalCode,
                city: city,
                emailid:emailid,
                phone:phone,
        
            });
        } else {
            userData.profile.address.name = name; // Updated field name
            userData.profile.address.emailid = emailid;
            userData.phone.profile.phone = phone;
            userData.profile.address[0].houseName = houseName;
            userData.profile.address[0].postalCode = postalCode;
            userData.profile.address[0].city = city;
        }

        userData.name = name;
        userData.email = emailid;
        userData.phone = phone;

        await userData.save();

        req.session.email = userData.email;
        req.session.user = userData.name;
        
        return res.render('user/profile', { user: true, userData, cartCount, success: "Successfully Updated" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).render('404-error', { error: error.message });
    }
}

const manageAddress= async(req,res)=>{
    const email = req.session.user;
        const { firstname,address, city, phone, postalCode } = req.body;
console.log(email +"email");
        const userData = await collectionModel.findOne({ email: email });
    console.log(userData+"userData")
    res.render('user/addressManage.ejs',{userData})
}


const addAddress = async(req,res)=>{
    try {
        if(req.session.user){
        console.log('i am profile')
        const userDetails = await collectionModel.findOne({ email: req.session.user });
        let cart = userDetails.cart.items;
        let cartCount = cart.length;
        const name = userDetails.profile.address;

        const user = true
        const FoundUser = req.session.user;
        const userData = await collectionModel.findOne({ email: FoundUser });
        res.render('user/addAddress', { user,userData, cartCount ,name});
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
    }
}

const addAddresspost = async (req, res) => {
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
        res.redirect("/manageAddress")

    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).send("Internal Server Error");
    }
};

const editAddress = async (req, res) => {
    try {
        const email = req.session.user;
        const addressId = req.params.id; // Extract the address ID from request parameters
        const userData = await collectionModel.findOne({ email: email });
        
        // Find the address based on the address ID
        const address = userData.profile.address.find(addr => addr._id.toString() === addressId);
        if (!address) {
            return res.status(404).render('error', { message: "Address not found" });
        }
        
        res.render("user/editAddress", { userData, address }); // Pass the address to the template
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).render('error', { message: "Error fetching user data" });
    }
}

const editAddresspost = async (req, res) => {
    try {
        const { name, houseName, phone, postalCode, city, addressId } = req.body;
        const userEmail = req.session.user;
        
        // Find the user by email
        const userData = await collectionModel.findOne({ email: userEmail });

        // Find the index of the address to be updated
        const addressIndex = userData.profile.address.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).send("Address not found");
        }

        // Update the address details
        userData.profile.address[addressIndex].name = name;
        userData.profile.address[addressIndex].houseName = houseName;
        userData.profile.address[addressIndex].phone = phone;
        userData.profile.address[addressIndex].postalCode = postalCode;
        userData.profile.address[addressIndex].city = city;

        // Save the updated user data
        await userData.save();

        // Redirect to the manageAddress page
        return res.redirect('/manageAddress');
    } catch (error) {
        console.error("Error editing address:", error);
        return res.status(500).render('error', { message: "Error editing address" });
    }
}


const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userEmail = req.session.user;
        
        
        // Find the user by email
        // const userData = await collectionModel.findOne({ email: userEmail });
        const user = await collectionModel.findOne({ email: userEmail });
        
        // Check if user exists
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Find the index of the address to be deleted
        const addressIndex = user.profile.address.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).send("Address not found");
        }

        // Remove the address from the array
        user.profile.address.splice(addressIndex, 1);
        
        // Save the updated user document
        await user.save();

        // Redirect to the manageAddress page
        res.redirect('/manageAddress');
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).send("Internal Server Error");
    }
};

  
// passwword
const managePassword = (req, res) => {
    res.render('user/passwordManage.ejs');
}

const changePassword = async (req, res) => {
    try {
        const userId = req.session.userid; 
        const { currentPassword, newPassword, confirmPassword } = req.body;
        console.log(req.body);

        // Find the user by ID
        const user = await collectionModel.findById(userId);
        console.log(user);

        // Verify current password
        if (user.password !== currentPassword) {
            return res.status(400).json({ error: ' current password' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }
        user.password = newPassword;
        await user.save();
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const logout =(req,res)=>{
    
    res.render("user/landing");
    }


// order
const order=async(req,res)=>{
    try {
        // Fetch orders from the database, you'll need to replace this with your actual logic
        const orders = await collectionOrder.find({ user: req.session.user });
        // Render the "user/order" view and pass the orders data
        res.render('user/order', { orders: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
    }
}

// success
const success=(req,res)=>{
    res.render("user/succes")
}

module.exports={
    login,loginpost,signuppost,home,logout,signup,otp,otppost,resendOtp,forget,products,details,landing,mac,airpod,watch,loadcart,cartDelete,Addcart,cartQuantityUpdate,checkoutpage,addressAdding,addressAddingpost,profile,updateprofile,addAddress,addAddresspost,editAddress,editAddresspost, deleteAddress,managePassword,changePassword,manageAddress,orderSuccess,order,success
}
