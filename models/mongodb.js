const mongoose = require('mongoose');
const collectionProduct = require('./product');
// mongoose.connect('mongodb://127.0.0.1:27017/Miniproject').then(()=>{
//     console.log('mongodb had connected');
// }).catch(()=>{
//     console.log('mongodb has not connected');
// })

const schema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
   phone:{
    type:Number,
    required:true
   },
   profile:{
    address: [{
        name: {
            type: String,
            required: true
        },
        houseName: {
            type: String,
            required: true
        },
       
        city: {
            type: String,
            required: true
        },
       
        phone: {
            type: Number,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        },
        emailid:{
            type:String,
            required:true
        },
        // Image:[{
        //     type:String,
        //     required:true
        //    }]
    }]
   },
   cart: {
    items: [{
        productname: {
            type: mongoose.Schema.Types.ObjectId,
            ref: collectionProduct
        },
        quantity: {
            type: Number,
            default: 1
        }, 
        totalprice: {
            type: Number,
        },
    }],
    grantTotal: {
        type: Number,
    }
},

   isBlocked:{
    type:Boolean,
    default:false
   }
})

const collectionModel = mongoose.model("userdetails",schema);
module.exports =collectionModel;