const collectionModel = require('../../models/userdb');
const collectionCat=require('../../models/category');
const collectionProduct = require('../../models/product');
const { products } = require('../usercontroller/usercontroller');
const collectionOrder = require('../../models/order');
const collectionCoupoun = require('../../models/coupoun');
const BannerDB=require("../../models/bannerdb")
const { render } = require('ejs');
const PDFDocument = require('pdfkit');
const excelJS = require('exceljs');

const fs = require('fs');

const login = (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin/home');
  } else {
    res.render('admin/login');
  }
};

const loginpost = (req,res)=>{
    const name = 'admin@gmail.com'
    const password = 'admin@123'
    console.log(req.body)
    if(name ===  req.body.username && password === req.body.password){
        console.log("here in login post")
        //adding session 
        req.session.admin = req.body.username;


        res.redirect("/admin/home")
       
    }else {
        res.send("wrong data....")
    }
}

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect("/admin/login");
    });
};


const home = async (req, res) => {
    if (req.session.admin) {
        const orderData = await collectionOrder.find();
        const user = await collectionModel.find().count();
        const product = await collectionProduct.find().count();
        const totalAmount = orderData.reduce((acc, item) => acc + Number(item.payment.amount), 0);
        const order = await collectionOrder.find().count()
        data = {
            totalAmount,
            user,
            product,
            order
        }
        
        res.render("admin/home",{data});
    } else {
        res.redirect('/admin/login');
    }
};

const user = async (req, res) => {
    try {
       

        const searchQuery = req.query.username || '';
        const userDetails = await collectionModel.find({
            name: { $regex: searchQuery, $options: 'i' }
        });

        console.log(searchQuery);
        res.render('admin/user', { userDetails, searchQuery });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};




const isBlocked = async (req, res) => {
    try {
        // Get the username from the query parameters
        const username = req.params.id;
        console.log(req.params.id);

        // Update the user's record in the database to set isblocked to true
        const user = await collectionModel.updateOne({ email: username }, { $set: { isBlocked: true } });
        console.log(user)

        // Redirect back to the user management page
        res.redirect('/admin/user');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

const notBlocked = async (req, res) => {
    try {
        // Get the username from the query parameters
        const username = req.params.id;
        await collectionModel.updateOne({ email: username }, {
            $set: {
                isBlocked: false
            }
        });
        res.redirect('/admin/user');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

// user ends

// catgeory starts



const order = async(req,res)=>{
    const orderList = await collectionOrder.find();
    const user = orderList.map(item => item.userId);
    const userData = await collectionModel.find({ _id: { $in: user } });
  
    const ordersWithData = orderList.map(order => {
       // console.log(' man its fear')
        const user = userData.find(user => user._id.toString() === order.userId.toString());
        return {
            ...order.toObject(),
            user: user
        };
    });
    const ordersWithDataSorted = ordersWithData.sort((a, b) => b.createdAt - a.createdAt);

    res.render("admin/order",{ordersWithDataSorted})
}

const orderput = async (req, res) => {
    try {
        const status = req.body.status;
        const { itemId, orderId } = req.params;

        // Find the order by ID
        const order = await collectionOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        // Find the item within the order
        const item = order.products.find(item => item._id.toString() === itemId.toString());
       const  product = await collectionProduct.findById(item.p_id);

        product.Stock += item.quantity;
        const user = await collectionModel.findById(order.userId);


        user.walletbalance = item.realPrice * item.quantity + user.walletbalance;
        user.wallethistory.push({
            process:"return from the admin",
            amount:item.realPrice * item.quantity,
        })
        if (!item) {
            return res.status(404).json({ error: "Item not found in the order" });
        }


        
        item.status = status;
        
        console.log(user.walletbalance)

        // Save the order with updated status
        await order.save();
        await user.save()
        await product.save()

        res.json(status);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json("Error updating order status");
    }
};


// const blockCoupon = async (req, res) => {
//     try {
//         const couponId = req.params.id;
//         const updatedCoupon = await collectionCoupoun.findByIdAndUpdate(couponId, { blocked: true }, { new: true });
//         res.json(updatedCoupon);
//     } catch (error) {
//         res.status(500).json({ error: "Error blocking coupon" });
//     }
// };

// const unblockCoupon = async (req, res) => {
//     try {
//         const couponId = req.params.id;
//         const updatedCoupon = await collectionCoupoun.findByIdAndUpdate(couponId, { blocked: false }, { new: true });
//         res.json(updatedCoupon);
//     } catch (error) {
//         res.status(500).json({ error: "Error unblocking coupon" });
//     }
// };

// banner


const sales = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        let salesReport = [];

        // Add logic to construct MongoDB query based on the start and end dates
        const query = {};

        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.createdAt = { $lte: new Date(endDate) };
        }

        const orderList = await collectionOrder.find(query);
        // console.log(orderList)

        salesReport = orderList.map( (order) => {
            let orderDetails = {}

            order.products.forEach((productList) => {
                order.proCartDetail.forEach((value)=>{
                    orderDetails = {
                        _id: productList._id,
                        p_name: productList.p_name,
                        address: order.address,
                        quantity: productList.quantity,
                        price: productList.realPrice,
                        createdAt: order.createdAt,
                        totalprice: value.OriginalPrice,
                        paymentMethod: order.payment 
                    }
                });
            });

            orderDetails.payment = order.payment
            return orderDetails
        })

        // orderList.forEach((item) => {
        //     item.products.forEach((productList) => {
        //         item.proCartDetail.forEach((value)=>{
        //             salesReport.push({
        //             _id: productList._id,
        //             p_name: productList.p_name,
        //             address: item.address,
        //             quantity: productList.quantity,
        //             price: productList.realPrice,
        //             createdAt: item.createdAt,
        //             totalprice: value.OriginalPrice,
        //             paymentMethod: item.payment 

        //         });
        //     });
        //     });
        // });
// console.log("hello",salesReport);


        console.log(salesReport, "sales report new object")
        req.session.salesReport = salesReport;

        res.render('admin/sales', { salesReport });
    } catch (error) {
        console.error("Error generating sales report:", error);
        res.status(500).send("Internal server error");
    }
};


const generatePDF = async (req, res) => {
    try {
        // Create a new PDF document
        const doc = new PDFDocument();

        const salesReport = req.session.salesReport;
        const username = req.session.username; // Assuming username is stored in session

        if (!Array.isArray(salesReport)) {
            salesReport = [];
        }

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Styling
        doc.font('Helvetica-Bold');
        const headerColor = '#333';
        const rowColor = '#666';

       // Add content to the PDF document
doc.fontSize(24).fillColor(headerColor).text('iStore', { align: 'center' }).moveDown();
doc.fontSize(20).fillColor(headerColor).text('Sales Report', { align: 'center' }).moveDown();

// Loop through the sales report data and add rows to the PDF
for (let i = 0; i < salesReport.length; i++) {
    const report = salesReport[i];

    const paymentMethod = report.payment.method.map( x => {
        return x.mode
    }).join(" ,")
    // Format each row with proper spacing and alignment
doc.moveDown().fillColor(rowColor);
doc.text(`Product Name: ${report.p_name}`);
doc.text(`Product ID: ${report._id}`);
doc.text(`Price: ${report.price}`);

// Check if offerPrice is defined before adding it to the PDF
if (report.totalprice!== undefined) {
    doc.text(`OfferPrice: ${report.payment.totalAmount}`); // Display the original price instead of offer price
} else {
    doc.text('Offer Price: Not Available');
}
    doc.text(`Quantity: ${report.quantity}`);

    // Check if address exists and has length greater than 0 before accessing its properties
    if (report.address && report.address.length > 0) {
        const address = report.address[0];
        doc.text(`Customer Name: ${address.name}`);
        doc.text(`House Name: ${address.houseName}`);
        doc.text(`City: ${address.city}`);
        doc.text(`City: ${address.phone}`);
        doc.text(`Postal Code: ${address.postalCode}`);
    } else {
        doc.text('Address Not Available');
    }

    doc.text(`Date of Purchase: ${report.createdAt}`);
    doc.text(`Payment Method: ${paymentMethod}`);
    doc.strokeColor(rowColor).lineWidth(1).moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
}


        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};


const downloadExcel = async (req, res) => {
    try {
        const salesReport = req.session.salesReport;

        // Check if data is present and is an array
        if (!Array.isArray(salesReport) || salesReport.length === 0) {
            throw new Error('Data is empty or not an array');
        }

        // Create a new workbook and add a worksheet
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Define column headers and widths
        worksheet.columns = [
            { header: 'Product ID', key: '_id', width: 15 },
            { header: 'Product Name', key: 'p_name', width: 20 },
            { header: 'Date', key: 'createdAt', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Offer Price', key: 'totalprice', width: 15 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
            { header: 'House Name', key: 'houseName', width: 20 },
            { header: 'City', key: 'city', width: 15 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Postal Code', key: 'postalCode', width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', width: 20 },
        ];

        // Add rows to the worksheet
        salesReport.forEach((item) => {
            // Extract address details from the first address object
            const address = item.address && item.address.length > 0 ? item.address[0] : {};

            const formattedDate = item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '';

            const paymentMethod = item.payment.method.map( x => {
                return x.mode
            })

            // Add row data to include address details and payment method
            worksheet.addRow({
                _id: item._id ? item._id.toString() : '',
                p_name: item.p_name || '',
                createdAt: formattedDate,
                quantity: item.quantity || '',
                price: item.price || '',
                totalprice: item.totalprice || '',
                customerName: address.name || '',
                houseName: address.houseName || '',
                city: address.city || '',
                phone: address.phone || '',
                postalCode: address.postalCode || '',
                paymentMethod: paymentMethod.join(", ")
            });
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        // Write the workbook to the response stream
        await workbook.xlsx.write(res);

        // End the response
        res.end();
    } catch (error) {
        console.error('Error generating Excel:', error.message);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

// const graph = async (req,res)=>{
//     try {
//         data = await collectionOrder.aggregate([
//             {
//               $match: {
                
//                 createdAt: {
//                   $gte: new Date(2022, 0, 1),
//                   $lt: new Date(2024 + 1, 0, 1)
//                 }
//               }
//             },
//             {
//                 $unwind: "$products"
//             },
//             {
//               $group: {
//                 _id: "$products.status", 
//                 count: { $sum: 1 } 
//               }
//             },
//             {
//               $project: {
//                 _id: 0, 
//                 label: "$_id", 
//                 value: "$count" 
//               }
//             }
//           ]);
          

//         res.json(data);
//     } catch (error) {
        
//     }
// }
const graph = async (req, res) => {
    try {
        // Assuming collectionOrder is your MongoDB collection
        const data = await collectionOrder.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(2022, 0, 1),
                        $lt: new Date(2024 + 1, 0, 1)
                    }
                }
            },
            {
                $unwind: "$products"
            },
            {
                $group: {
                    _id: "$products.status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    label: "$_id",
                    value: "$count"
                }
            }
        ]);

        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = {
    login,loginpost,logout,home,user,
    isBlocked,notBlocked,
    order,orderput,
    sales,generatePDF,downloadExcel,graph
};
