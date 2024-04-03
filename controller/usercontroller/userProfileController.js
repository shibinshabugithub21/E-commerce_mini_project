const collectionModel = require('../../models/userdb');
const collectionCat=require('../../models/category');


// profile

const profile = async(req,res)=>{
    try {
        if(req.session.user){
        console.log('i am profile')
        const category =await collectionCat.find({isBlocked:false})
        const userData = await collectionModel.findOne({ _id: req.session.userid});
        const name = userData.profile.address;

        const user = true
       
        res.render('user/profile', { user,userData,name,category});
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
        const category =await collectionCat.find({isBlocked:false})
    console.log(userData+"userData")
    res.render('user/addressManage.ejs',{userData,category})
}


const addAddress = async(req,res)=>{
    try {
        if(req.session.user){
        console.log('i am profile')
        const category =await collectionCat.find({isBlocked:false})

        const userDetails = await collectionModel.findOne({ email: req.session.user });
        let cart = userDetails.cart.items;
        let cartCount = cart.length;
        const name = userDetails.profile.address;

        const user = true
        const FoundUser = req.session.user;
        const userData = await collectionModel.findOne({ email: FoundUser });
        res.render('user/addAddress', { user,userData, cartCount,category ,name});
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
    }
}

const addAddresspost = async (req, res) => {
    const { name, houseName, city, phone, postalCode} = req.body;
    const userId = req.session.user; 
    try {
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
        const category =await collectionCat.find({isBlocked:false})
        const userData = await collectionModel.findOne({ email: email });
        
        const address = userData.profile.address.find(addr => addr._id.toString() === addressId);
        if (!address) {
            return res.status(404).render('error', { message: "Address not found" });
        }
        
        res.render("user/editAddress", { userData, address,category}); // Pass the address to the template
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
       
        const user = await collectionModel.findOne({ email: userEmail });
        
        // Check if user exists
        if (!user) {
            return res.status(404).send("User not found");
        }
        const addressIndex = user.profile.address.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).send("Address not found");
        }
        user.profile.address.splice(addressIndex, 1);
        
        await user.save();

        res.redirect('/manageAddress');
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).send("Internal Server Error");
    }
};

// passwword
const managePassword = async (req, res) => {
    const category =await collectionCat.find({isBlocked:false})
    res.render('user/passwordManage.ejs',{category});
}

const changePassword = async (req, res) => {
    try {
        const userId = req.session.userid; 
        const { currentPassword, newPassword, confirmPassword } = req.body;
        console.log(req.body);

        // Find the user by ID
        const user = await collectionModel.findById(userId);
        console.log(user);
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