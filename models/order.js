const mongoose = require("mongoose");
const collectionModel = require("./userdb");
const {v4:uuidv4}=require("uuid")
// Define the order schema
const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: collectionModel // Reference to the User collection
    },
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
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    }],
    products: [{
        orderCancleRequest: {
            type: Boolean,
            default: false
        },
        orderReturnRequest: {
            type: Boolean,
            default: false
        },
        p_id:{
            type:String,
            default:uuidv4
        },
        p_name: {
            type: String,
            required: true 
        },
        realPrice: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: [{
            type: String,
            required: true
        }],
        category: [{
            type: String,
            required: true
        }],
        
        quantity: {
            type: Number,
            required: false
        },
        status:{
            type:String,
            enum:['Processing', 'Cancelled','Delivered',"Shipped","Return Request","Return"],
            default:"Processing"
        },
        reason:{
            type:String
        }
    }],
    payment: {
        method: {
            type: String,
        },
        amount: {
            type: String,
        }
    },
    proCartDetail: {
        type: Array
    },
    cartProduct: {
        type: Array
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    expectedDelivery: {
        type: Date,
    }
});

const collectionOrder = mongoose.model('Order', schema);

module.exports = collectionOrder;
