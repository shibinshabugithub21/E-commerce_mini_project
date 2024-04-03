
const collectionCoupoun = require('../../models/coupoun');

// coupoun managment
const coupounsList = async (req, res) => {
    try {
        const coupons = await collectionCoupoun.find();
        res.render("admin/coupoun", { coupons });
    } catch (error) {
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

        const couponDetails = new collectionCoupoun({
            couponName:couponCode,
            couponValue:discountType,
           maxValue: discountAmount,
            expiryDate:expiryDate,
        });

        
        await couponDetails.save();

        res.status(201).json({ message: "Coupon created successfully" });
    } catch (error) {
        // Handle errors
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: "Coupon creation failed: " + error.message });
    }
};

const coupounDelete = async (req, res) => {
    try {
        const couponId = req.params.id; 
        await collectionCoupoun.findByIdAndDelete(couponId);
        res.redirect('/admin/coupoun');
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Coupon deletion failed: ' + error.message });
    }
};
module.exports={
    coupounsList,couponsAdding,couponCreation,coupounDelete,
}