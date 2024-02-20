const mongoose = require("mongoose");
const collectionModel = require("./mongodb");

// Define the order schema
const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: collectionModel // Reference to the User collection
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: collectionModel // Reference to the Address collection
    },
    status: {
        type: String,
        default: "Processing"
    },
    orderCancleRequest: {
        type: Boolean,
        default: false
    },
    orderReturnRequest: {
        type: Boolean,
        default: false
    },
    products: [{
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
