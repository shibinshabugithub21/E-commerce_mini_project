const mongoose =require('mongoose');

const schema = new mongoose.Schema({
     userId:[{
        type:String
     }],
     couponName:{
        type:String,
        require:true,
        unique: true
     },
     couponValue:{
        type:String,
        require:true
     },
     expiryDate:{
        type:String,
        require:true
     },
     maxValue:{
        type:String,
        require:true
     },
     blocked: { type: Boolean, default: false } 

});

const collectionCoupoun  = mongoose.model('coupon',schema);
module.exports = collectionCoupoun;