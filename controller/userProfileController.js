const collectionModel = require('../models/userdb');
const collectionCat=require('../models/category');
const collectionProduct = require('../models/product');
const { products } = require('./usercontroller');
const collectionOrder = require('../models/order');
const collectionCoupoun = require('../models/coupoun');
const collectionBanner=require("../models/bannerdb")
const { render } = require('ejs');
const PDFDocument = require('pdfkit');
const excelJS = require('exceljs');

const fs = require('fs');


// profile

const profile = async(req,res)=>{
    try {
        if(req.session.user){
        console.log('i am profile')
        console.log(req.session.user)
        console.log(req.session.userid)
        const userData = await collectionModel.findOne({ _id: req.session.userid});
        // let cart = userDetails.cart.items;
        // let cartCount = cart.length;
        console.log(userData);
        const name = userData.profile.address;

        const user = true
        // const FoundUser = req.session.user;
        // const userData = await collectionModel.findOne({ email: FoundUser });
        res.render('user/profile', { user,userData,name});
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
        console.log(req.body)
        console.log(typeof phone);


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
        }

        userData.name = name;
        userData.email = emailid;
        userData.phone = phone;

        await userData.save();

        req.session.email = userData.email;
        
        return res.redirect('/profile');
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
    try {
        // Assuming you have a model for your collection
        const user = await collectionModel.findOne({ email : userId});

        const phone1 = parseInt(phone); 
        const postal = parseInt(postalCode);


        // Create a new address object
        const newAddress = {
            name: name,
            houseName: houseName,
            city: city,
           postalCode: postal,
            phone:  phone1
        };

        // Push the new address object into the addresses array
        user.profile.address.push(newAddress);

        // Save the updated user document
        await user.save();


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
            // return res.status(400).json({ error: ' current password' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }
        const newpass = await bcrypt.hash(newPassword,10)
        user.password = newpass;
        await user.save();
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports ={
deleteAddress,editAddresspost,addAddress,addAddresspost,editAddress,manageAddress,profile,
updateprofile,managePassword,changePassword
}