const mongoose = require('mongoose');


const schema =new mongoose.Schema({
    Category:{
        type:String,
        required:true
    },
   isBlocked:{
    type:Boolean,
    default:true
   }
})

const collectionCat = mongoose.model("Category",schema);
module.exports =collectionCat;