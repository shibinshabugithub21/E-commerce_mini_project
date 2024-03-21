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
const pdf = require('pdfkit');
const path = require('path');
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
        // console.log(orders)
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
        
        const onlinePayments = order.payment.method.find((meth) => meth.mode != "cashondelivery")
        if(!onlinePayments){
            const bal= await collectionModel.updateOne(
                { _id: req.session.userid, walletbalance: { $exists: true } },
                { $inc: { walletbalance: onlinePayments.amount } }
            );
            console.log("balaaaaaaance",bal);
            
            user.wallethistory.push({
                process:onlinePayments.mode,
                amount: onlinePayments.amount,
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
//         // Find the user by session ID
//         const user = await collectionModel.findOne({ _id: req.session.userid });

//         // Find the order by ID
//         const order = await collectionOrder.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         console.log("log",order);
//         console.log("logogggg",productId);

//         // Find the product to cancel in the order
//         const productToCancel = await collectionOrder.products.find(product => product.p_id.toString() === productId);
//         console.log("kfdklfkjd",productToCancel);
//         if (!productToCancel) {
//             return res.status(404).json({ message: "Product not found in the order" });
//         }

//         // Find the corresponding product in the database
//         const product = await collectionProduct.findById(productId);
//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         // Update the product's stock
//         product.Stock += productToCancel.quantity;
//         await product.save();

//         // If payment method is not cash on delivery, update user's wallet balance
//         if (order.payment.method !== "cashondelivery") {
//             // Ensure walletbalance is a number, if not set it to 0
//             if (isNaN(user.walletbalance)) {
//                 user.walletbalance = 0;
//             }
//             // Update wallet balance
//             user.walletbalance += order.payment.amount;
//             await user.save();

//             // Add wallet transaction to user's history
//             user.wallethistory.push({
//                 process: order.payment.method,
//                 amount: productToCancel.quantity * productToCancel.realPrice
//             });
//             await user.save();
//         }

//         // Mark the product as cancelled in the order
//         productToCancel.status = "Cancelled";
//         await order.save();

//         // Send success response
//         res.status(200).json({ message: "Order cancelled successfully", order });
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

const generateInvoice = async (req, res) => {
    try {
        // Fetch orderId and productId from request parameters
        const { orderId, productId } = req.params;

        // Create the directory if it does not exist
        const invoiceDirectory = path.join(__dirname, '..', 'invoices');
        if (!fs.existsSync(invoiceDirectory)) {
            fs.mkdirSync(invoiceDirectory, { recursive: true });
        }

        // Fetch order details from the database
        const order = await collectionOrder.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Find the product in the order based on productId
        const product = order.products.find(prod => prod._id.toString() === productId);
        if (!product) {
            return res.status(404).send('Product not found in the order');
        }

        // Create a PDF document
        const doc = new pdf();
        const invoicePath = path.join(invoiceDirectory, `invoice_${orderId}_${productId}.pdf`);
        doc.pipe(fs.createWriteStream(invoicePath));

        // Add content to the PDF document
        doc.font('Helvetica-Bold').fontSize(24).text('', { align: 'center' }).moveDown(0.5);
        doc.font('Helvetica').fontSize(16).text('iStore', { align: 'center' });
        doc.text('India,Kerala,Trv', { align: 'center' });
        doc.text('Phone No:9207951313 ', { align: 'center' });
        doc.text('Email:istore@gmai', { align: 'center' }).moveDown(2);
        
        doc.font('Helvetica-Bold').text('Customer Details:');
        doc.font('Helvetica').text(`Name: ${order.address[0].name}`);
        doc.text(`Address: ${order.address[0].houseName}, ${order.address[0].city}, ${order.address[0].postalCode}, ${order.address[0].country}`);
        doc.text(`Phone No: ${order.address[0].phone}`);
        doc.text(`Email: `); // You can add customer email here if available

        doc.moveDown(2);
        doc.font('Helvetica-Bold').text('Invoice Details:');
        doc.font('Helvetica').text(`Invoice No: ${Math.floor(Math.random() * 900000) + 100000}`);
        doc.text(`Date of Order: ${order.createdAt.toDateString()}`);
        doc.text(`Date of Bill: ${new Date().toDateString()}`);
        doc.moveDown(2);

        doc.font('Helvetica-Bold').text('Product Details:');
        doc.font('Helvetica').text(`Product Name: ${product.p_name}`);
        doc.text(`Quantity: ${product.quantity}`);
        doc.text(`Price: ₹${product.price}`);
        // Add more product details as needed

        // Calculate total amount
        const totalAmount = product.quantity * parseFloat(product.price);
        doc.font('Helvetica-Bold').text(`Total Amount: ₹${totalAmount}`, { align: 'right' });

        // Finalize the PDF document
        doc.end();

        // Send the PDF file as a response
        res.sendFile(invoicePath);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
order,orderReturn,cancelOrder,generateInvoice
}