const collectionModel = require('../../models/userdb');
const collectionCat=require('../../models/category');
const collectionProduct = require('../../models/product');
const { products } = require('./usercontroller');
const collectionOrder = require('../../models/order');
const collectionCoupoun = require('../../models/coupoun');
const collectionBanner=require("../../models/bannerdb")
const { render } = require('ejs');
const PDFDocument = require('pdfkit');
const excelJS = require('exceljs');

const fs = require('fs');
const { product } = require('../admincontroller/admincontroller');

// order
const order=async(req,res)=>{
    try {
        const orders = await collectionOrder.find({ userId: req.session.userid });
        const category =await collectionCat.find({isBlocked:false})
        let listItems = [];
        for(let order of orders){
            listItems.push(order.products)
        }
        res.render('user/order', { orders,listItems,category});
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
    }
    
}
const cancelOrder = async (req, res) => {
    
    const {orderId,productId} =  req.params
    
    try {
        const user=await collectionModel.findOne({_id:req.session.userid})
        const order = await collectionOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({ message:"Order not found"});
        }
        
       
        const productToCancel = order.products.find(products => products.p_id.toString() === productId);
     

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
            return res.status(404).json({ message: "Product not found in the order" });
        }
        
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
        next(error); 
    }
};

module.exports = {
order,orderReturn,cancelOrder
}