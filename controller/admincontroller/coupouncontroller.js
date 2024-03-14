
const collectionCoupoun = require('../../models/coupoun');


const fs = require('fs');

// coupoun managment

const coupounsList = async (req, res) => {
    try {
        // Fetch all coupons from the database
        const coupons = await collectionCoupoun.find();

        // Render the admin/coupoun view with the list of coupons
        res.render("admin/coupoun", { coupons });
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
};

const couponsAdding = async (req,res)=>{
   
    res.render("admin/AddCoupoun",)
}
const couponCreation = async (req, res) => {
    try {
        console.log('Received data:', req.body);
        const { couponCode, discountAmount, discountType, expiryDate } = req.body;

        // Create a new coupon instance with the received data
        const couponDetails = new collectionCoupoun({
            couponName:couponCode,
            couponValue:discountType,
           maxValue: discountAmount,
            expiryDate:expiryDate,
        });

        
        await couponDetails.save();

        // Send a success response
        res.status(201).json({ message: "Coupon created successfully" });
        // res.redirect("/admin/coupoun");
    } catch (error) {
        // Handle errors
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: "Coupon creation failed: " + error.message });
    }
};

const coupounDelete = async (req, res) => {
    try {
        const couponId = req.params.id; // Assuming the coupon ID is passed in the URL params

        // Find the coupon by ID and delete it
        await collectionCoupoun.findByIdAndDelete(couponId);

        // Redirect to the coupon list page or send a success response
        res.redirect('/admin/coupoun');
        // Or send a JSON response if it's an API endpoint
        // res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        // Handle errors
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Coupon deletion failed: ' + error.message });
    }
};
module.exports={
    coupounsList,couponsAdding,couponCreation,coupounDelete,
}