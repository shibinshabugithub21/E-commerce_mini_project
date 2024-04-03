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
        if(onlinePayments){
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
console.log("hii");
        // Create the directory if it does not exist
        const invoiceDirectory = path.join(__dirname, '..', 'invoices');
        if (!fs.existsSync(invoiceDirectory)) {
            fs.mkdirSync(invoiceDirectory, { recursive: true });
        }

        // Fetch order details from the database
        const order = await collectionOrder.findOne({ _id: orderId });
        console.log('O000000000000000000rder:', order); // Log the order object

        if (!order) {
            return res.status(404).send('Order not found');
        }
        const user = await collectionModel.findOne();

        // Find the product in the order based on productId
        const product = order.products.find(prod => prod._id.toString() === productId);
        if (!product) {
            return res.status(404).send('Product not found in the order');
        }

          // Check if the order status is "Delivered"
          if (product.status !== "Delivered") {
            return res.status(400).send('Invoice can only be generated for orders with status "Delivered"');
        }
        else{

        // Create a PDF document
        const doc = new pdf();
        const invoicePath = path.join(invoiceDirectory, `invoice_${orderId}_${productId}.pdf`);
        doc.pipe(fs.createWriteStream(invoicePath));

        // Add content to the PDF document
        doc.font('Helvetica-Bold').fontSize(24).text('iStore', { align: 'center' });
        doc.text('India, Kerala, Thiruvananthapuram', { align: 'center' });
        doc.text('Phone No: 9207951313 ', { align: 'center' });
        doc.text('Email: istore@gmai', { align: 'center' }).moveDown(2);

   // Draw Customer Details
doc.font('Helvetica-Bold').fontSize(8).text('Customer Details:', { underline: true }).moveDown(0.5);
doc.text(`Name: ${order?.address[0]?.name || 'N/A'}`);
doc.text(`Address: ${order.address[0]?.houseName || 'N/A'}, ${order.address[0]?.city || 'N/A'}, ${order.address[0]?.postalCode || 'N/A'}`);
doc.text(`Phone No: ${order.address[0]?.phone || 'N/A'}`);
doc.text(`Email: ${user.email}`).moveDown(2);

        // Draw Invoice Details
        doc.font('Helvetica-Bold').fontSize(8).text('Invoice Details:', { underline: true }).moveDown(0.5);
        doc.text(`Invoice No: ${Math.floor(Math.random() * 900000) + 100000}`);
        doc.text(`Date of Order: ${order.createdAt.toDateString()}`);
        doc.text(`Date of Bill: ${new Date().toDateString()}`).moveDown(2);

        // Draw Product Details Table
        doc.font('Helvetica-Bold').fontSize(16).text('Product Details:', { underline: true }).moveDown(0.5);
        drawTable(doc, {
            headers: ['Product Name', 'Quantity', 'Payment Method'],
            rows: [
                [product.p_name, product.quantity, order.payment.method.map(x => x.mode).join(", ")]
            ],
            x: 50,
            y: doc.y,
            width: 500,
            padding: 5
        })

        doc.font('Helvetica-Bold').fontSize(16).text('_______________',).moveDown(0.5);
        // Calculate total amount
          // Add delivery fee to the total amount
        // Calculate total amount
const totalAmount = order.payment.method.reduce((acc, x) => acc + parseFloat(x.amount), 0);
const deliveryFee = 10;
const totalAmountWithDelivery = totalAmount - deliveryFee;

// Draw Total Price
doc.font('Helvetica-Bold').text(`Total Price: ${totalAmount}`, { align: 'right' }).moveDown(0.5);

// Draw Delivery Fee
doc.font('Helvetica-Bold').text(`Delivery Fee: ${deliveryFee}`, { align: 'right' }).moveDown(0.5);

// Draw Total Amount
doc.font('Helvetica-Bold').text(`Total Amount: ${totalAmountWithDelivery}`, { align: 'right' });


        // Finalize the PDF document
        doc.end();

        // Send the PDF file as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

        // Stream the generated PDF to the response
        const pdfStream = fs.createReadStream(invoicePath);
        pdfStream.pipe(res);

        // Clean up: Delete the generated PDF file after streaming
        pdfStream.on('end', () => {
            fs.unlinkSync(invoicePath);
        });
    } 
}
catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to draw a table
function drawTable(doc, params) {
    let { headers, rows, x, y, width, padding } = params;

    const headerHeight = 20;
    const rowHeight = 20;
    const cellWidth = width / headers.length;

    // Draw header row
    doc.fillColor('black').fontSize(12).font('Helvetica-Bold');
    for (let i = 0; i < headers.length; i++) {
        doc.text(headers[i], x + i * cellWidth, y, { width: cellWidth, align: 'center' });
    }
    y += headerHeight;

    // Draw rows
    doc.fontSize(12).font('Helvetica');
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (let j = 0; j < row.length; j++) {
            doc.text(row[j]?.toString(), x + j * cellWidth, y + i * rowHeight, { width: cellWidth, align: 'center' });
        }
    }
}


module.exports = {
order,orderReturn,cancelOrder,generateInvoice
}