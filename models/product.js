const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/Miniproject').then(()=>{
//     console.log('mongodb had connected');
// }).catch(()=>{
//     console.log('mongodb has not connected');
// })

const schema =new mongoose.Schema({
    Productname:{
        type:String,
        required:true
    },
    Category:{
        type:String,
        required:true
    },
    Stock:{
        type:Number,
        required:true
    },
   Price:{
    type:Number,
    required:true
   },
   Rating:{
    type:Number,
    required:true
   },
   Description:{
    type:String,
    required:true
   },
    isDelete:{
    type:Boolean,
    default:true
   },
   Image:[{
    type:String,
    required:true
   }]
})

const collectionProduct = mongoose.model("Products",schema);
module.exports =collectionProduct;