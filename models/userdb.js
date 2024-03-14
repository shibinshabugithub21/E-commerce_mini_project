const mongoose = require('mongoose');
const collectionProduct = require('./product');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    profile: {
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
            // emailid: {
            //     type: String,
            //     required: true
            // }
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
                type: Number
            }
        }],
        grantTotal: {
            type: Number
        }
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    wishlist: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: collectionProduct
        }
    }],
    walletbalance:{
        type:Number,
        default:0
    },
    wallethistory: [
        {   
            process:{
                type: String // Payment or TopUp or Refund
            },  
            amount: {
                type:Number
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],

});

const collectionModel = mongoose.model("userdetails", schema);
module.exports = collectionModel;