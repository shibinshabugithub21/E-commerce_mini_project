const collectionModel = require('../models/userdb');
const collectionCat=require('../models/category');
const collectionProduct = require('../models/product');
const { products } = require('./usercontroller');
const collectionOrder = require('../models/order');
const collectionCoupoun = require('../models/coupoun');
const collectionBanner=require("../models/bannerdb")
const { render } = require('ejs');
const PDFDocument = require('pdfkit');
const excelJS = require('exceljs');

const fs = require('fs');
const { product } = require('./admincontroller');

// order
const order=async(req,res)=>{
    try {
        // Fetch orders from the database, you'll need to replace this with your actual logic
        const orders = await collectionOrder.find({ userId: req.session.userid });
        // Render the "user/order" view and pass the orders data
        // console.log(orders[0].product,"here")
        let listItems = [];
        for(let order of orders){
            listItems.push(order.products)
        }
        // console.log(orders);
        res.render('user/order', { orders,listItems });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
    }
    
}
const cancelOrder = async (req, res) => {
    
    const {orderId,productId} =  req.params
    // console.log("here");
    // console.log(orderId);
    // console.log(productId);
    try {
        // Find the order in the database
        const user=await collectionModel.findOne({_id:req.session.userid})
        // const wallet=user.wallethistory
        console.log("look at yoou",req.session.userid);
        // const walletbal = user.walletbalance
        const order = await collectionOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({ message:"Order not found"});
        }
        console.log(order)
        console.log(productId);
        // console.log("order",order);
        // const itemcancel= order.products.find(items => items._id.toString()===itemId)
        const productToCancel = order.products.find(products => products.p_id.toString() === productId);
        // console.log(order.payment,"PATTTT");
        // console.log(order.payment.amount,"fffffff");

        let product = await collectionProduct.findById(productId)

        product.Stock += productToCancel.quantity;
        await product.save()
        

        if(order.payment.method !="cashondelivery"){
            await collectionModel.updateOne({_id:req.session.userid},{$inc:{walletbalance:order.payment.amount}})

            user.wallethistory.push({
                process:order.payment.method,
                amount:productToCancel.quantity * productToCancel.realPrice,
            })
           
            await user.save()
        }

        if (!productToCancel) {
            // console.log("here is out here")
            return res.status(404).json({ message: "Product not found in the order" });
        }
        // Update the order status to "Cancelled"
        
        // itemcancel.status = "Cancelled";
        productToCancel.status = "Cancelled";

        await order.save();

        res.status(200).json({ message: "Order cancelled successfully", order });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
// const cancelOrder = async (req, res) => {
//     const { orderId, productId } = req.params;

//     try {
//         const order = await collectionOrder.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

        
//         const user = await collectionModel.findOne({ _id: req.session.userid });
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const productToCancel = order.products.find(product => product.p_id.toString() === productId);
//         if (!productToCancel) {
//             return res.status(404).json({ message: "Product not found in the order" });
//         }

//         const product = await collectionProduct.findById(productId);
//         console.log(product)
//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         product.Stock += productToCancel.quantity;
//         // await product.save();

//         if (order.payment.method !== "cashondelivery") {
//             const refundAmount = productToCancel.quantity * productToCancel.realPrice;
//             user.walletbalance += refundAmount;
//             user.wallethistory.push({
//                 process: order.payment.method,
//                 amount: refundAmount
//             });
//             // await user.save();
//         }

//         productToCancel.status = "Cancelled";
//         // await order.save();

//         const updatedProduct = await collectionProduct.findById(productId);
//         const responseData = {
//             message: "Order cancelled successfully",
//             product: updatedProduct
//         };

//         res.status(200).json(responseData);
//     } catch (error) {
//         console.error('Error cancelling order:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };


const orderReturn= async (req, res, next) => {
    try {
        const {orderId, productId, reason} = req.body;

        const productData = await collectionOrder.findById(orderId);
        productData.products.forEach(item => {
            if (item.p_id === productId) {
                item.status = "Return Request";
                item.reason = reason;
            }
        });
        await productData.save();
        res.json({success: true, message: 'Product returned successfully.'});
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
};

module.exports = {
order,orderReturn,cancelOrder
}