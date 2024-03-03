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


// const collectionProduct=require('../models/product');

const login = (req, res) => {
  // Check if the user is already logged in
  if (req.session.admin) {
    res.redirect('/admin/home');
  } else {
    res.render('admin/login');
  }
};

const loginpost = (req,res)=>{
    
    const name = 'admin@gmail.com'
    const password = 'admin12345'
    console.log(req.body)
    if(name ===  req.body.username && password === req.body.password){
        console.log("here in login post")
        //adding session 
        req.session.admin = req.body.username;
        // adminsession = req.session.admin;


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



  
// user 
// const user = async(req,res)=>{

//     try{
//         const searchQuery =req.query.search  || '' ;
//         const userDetails = await collectionModel.find({
//             name:{ $regex:searchQuery, $options: 'i'}
//         })
//         console.log(searchQuery)
//         res.render('admin/user',{userDetails,searchQuery})
//     }catch(error){
//         console.error(error);
//         res.status(500).send('Internal Server Error');
// }
//

const home = (req, res) => {
    if (req.session.admin) {
        res.render("admin/home");
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
        let user = await collectionModel.updateOne({ email: username }, { $set: { isBlocked: true } });
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

const category = async (req, res) => {
    try {
        
        // Fetch categories from the database
        const categoryList = await collectionCat.find({});
        
        // Render the category page with the fetched categories
        res.render('admin/category', { category: categoryList });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const addcategory = (req, res) => {
    res.render('admin/addcategory', { status: true, mes: "" })
}

const addcategorypost = async (req, res) => {
    try {
        const category = req.body.category.trim().toLowerCase(); // Convert to lowercase

        const existingCategory = await collectionCat.findOne({ Category: { $regex: new RegExp("^" + category + "$", "i") } });

        if (!existingCategory) {
            const insertingObject = {
                Category: category,
            };
            const newCategory = await collectionCat.insertMany([insertingObject]);

            console.log("New category successfully added:", newCategory);

            res.status(201).json({ mes: "success" });
        } else {
            console.log("Item already exists");
            res.status(400).json({ mes: "Category already exists" });
        }
    } catch (error) {
        console.error("Error during adding:", error);
        res.status(500).send("Internal server error");
    }
};

const editcategory = async (req, res) => {
    try {
        const editcat = req.params.id;
        // Correct usage of findById
        const Category = await collectionCat.findById(editcat);
        console.log(Category)
        res.render("admin/editcategory", { Category });
    } catch (error) {
        console.log(error);
    }
};

const update = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const newName = req.body.name;

        const category = await collectionCat.findById(categoryId);
        console.log(newName)

        if (category) {
            if (newName.trim() !== "") {
                category.Category = newName;
                await category.save();  // Correct way to save changes
                res.redirect('/admin/category');
            } else {
                console.log("Error: New name cannot be empty");
                res.status(400).send("New name cannot be empty");
            }
        } else {
            console.log("Error: Category not found");
            res.status(404).send("Category not found");
        }
    } catch (error) {
        console.error("Error during update:", error);
        res.status(500).send("Internal server error");
    }
};

const deletecategory = async (req, res) => {
    try {
        const deletecategory = req.params.id;
        // console.log(deletecategory);
        await collectionCat.findByIdAndDelete(deletecategory);
        res.redirect('/admin/category');  // Add a forward slash at the beginning
    } catch (error) {
        console.log(error);
        // Handle the error, send an appropriate response, or redirect to an error page
        res.status(500).send("Internal Server Error");
    }
};

// catgory ends

// products starts
const product = async (req, res) => {
    try {
        

        // Fetch products from the database
        const productList = await collectionProduct.find({});
        
        // Render the product page with the fetched products
        res.render('admin/product', { product: productList });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const addproduct = (req, res) => {
    // Check if the user is authenticated
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    res.render('admin/addproduct');
};



const addproductpost = async (req, res) => {
    try {
        const files = req.files;
        console.log(files);

        const data = {
            Productname: req.body.productName,  // Use the correct case
            Category: req.body.category,
            Stock: req.body.stock,
            Rating: req.body.rating,
            Price: req.body.price,
            Description: req.body.description,
            Image: files.map(file => file.filename)
        };

        // Use the correct case for the Mongoose model
        const newProduct = await collectionProduct.insertMany([data]);
        // res.redirect('/admin/addproduct');

        console.log("New product successfully added:", newProduct);
        const product = await collectionProduct.find({});
        res.render('admin/product', { product });
        // res.status(201).json({ mes: "success" });
    } catch (error) {
        console.error("Error during adding:", error);
        res.status(500).send("Internall server error");
    }
};

const editproduct = async(req,res)=>{


    try {
        const productId = req.params.id;

        const element = await collectionProduct.findById(productId);
        console.log(element.Image[0]);

        res.render('admin/editproduct',{element});

    } catch (error) {
        console.log(error)
    }
}

const editproductpost = async(req,res)=>{

    console.log("we are here")
    try {
        const productId =req.params.id;
        console.log("hello",productId);
        const image = req.files;
        console.log("img",req.image, req.files, req.file)
        const products = await collectionProduct.findById(productId);

        if(!productId){
            return res.status(404).send("priduct not found");
        }
            products.Productname = req.body.productName;  
            products.Category = req.body.category;
            products.Stock= req.body.stock;
            products.Rating= req.body.rating;
            products.Price =req.body.price;
            products.Description= req.body.description;

            if(req.files && req.files.length > 0){
                products.Image =products.Image.concat(image.map(file=>file.filename));
            }
  await products.save();
  res.redirect('/admin/product');
    } catch (error) {
        console.log(error)
        res.status(500).send(error.message)
    }
}


const deletImage = async(req,res)=>{
    try {
        console.log("here in the deleting phase");
        const {productId,imgName} = req.body;
      
        const product = await collectionProduct.findById(productId);
       const filteredImg = product.Image.filter(item => item != imgName );
       product.Image = filteredImg;
       await product.save()
    } catch (error) {
        console.log(error.message)

    }
}
// const update = async (req, res) => {
//     try {
//       const productId = req.params.id;
  
//       // Fetch the product by ID
//       const product = await collection.findById(productId);
  
//       if (!product) {
//         return res.status(404).send('Product not found');
//       }
  
//       // Update product information based on form data
//       product.productname = req.body.productname;
//       product.price = req.body.price;
//       product.rating = req.body.rating;
//       product.model = req.body.model;
//       product.description = req.body.description;
//       product.stock = req.body.stock;
//       product.category = req.body.category;
  
//       // Append new images to the existing ones only if newImage is present in the form data
//       if (req.files && req.files.length > 0) {
//         product.image = product.image.concat(req.files.map(file => file.path));
//       }
  
//       // Save the updated product
//       await product.save();
  
//       res.redirect("/admin/homee");
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     }
//   };


const deleteproduct = async(req,res)=>{
    try{
        const deleteproduct = req.params.id;
        await collectionProduct.findByIdAndDelete(deleteproduct);
        res.redirect('/admin/product');
    }
    catch(error){
        res.status(500).send("internal servr error");
    }
};

const isdelete = async (req, res) => {
    try {
        const productId =req.params.id;
        console.log(req.params.id);

        let nproduct = await collectionProduct.updateOne({ _id:productId }, { $set: { isDelete: true } });
          console.log();

        res.redirect('/admin/product');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

const notdelete = async (req, res) => {
    try {
        // Get the username from the query parameters
        const productId =req.params.id
        await collectionProduct.updateOne({ _id: productId }, {
            $set: {
                isDelete: false
            }
        });
        console.log(productId)
        res.redirect('/admin/product');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};

const order = async(req,res)=>{
    const orderList = await collectionOrder.find();

    const user = orderList.map(item => item.userId);
    const userData = await collectionModel.find({ _id: { $in: user } });
   // console.log('hello man i am inside')
    //console.log(userData)
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

        console.log(orderId);
        console.log(status);
        console.log(itemId);

        // Find the order by ID
        const order = await collectionOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        // Find the item within the order
        const item = order.products.find(item => item._id.toString() === itemId.toString());
        console.log(item)
        if (!item) {
            return res.status(404).json({ error: "Item not found in the order" });
        }
        console.log(item)

        // Update the status of the item
        item.status = status;

        // Save the order with updated status
        await order.save();

        res.json(status);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json("Error updating order status");
    }
};


// coupoun managment

const coupounsList = async (req, res) => {
    try {
        // Fetch all coupons from the database
        const coupons = await collectionCoupoun.find();

        // Render the admin/coupoun view with the list of coupons
        res.render("admin/coupoun", { coupons });
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
};

const couponsAdding = async (req,res)=>{
   
    res.render("admin/AddCoupoun",)
}
const couponCreation = async (req, res) => {
    try {
        console.log('Received data:', req.body);
        const { couponCode, discountAmount, discountType, expiryDate } = req.body;

        // Create a new coupon instance with the received data
        const couponDetails = new collectionCoupoun({
            couponName:couponCode,
            couponValue:discountType,
           maxValue: discountAmount,
            expiryDate:expiryDate,
        });

        // Save the coupon details to the database
        // await couponDetails.save();

        // Send a success response
        res.status(201).json({ message: "Coupon created successfully" });
        res.redirect("/admin/coupoun");
    } catch (error) {
        // Handle errors
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: "Coupon creation failed: " + error.message });
    }
};

const coupounDelete = async (req, res) => {
    try {
        const couponId = req.params.id; // Assuming the coupon ID is passed in the URL params

        // Find the coupon by ID and delete it
        await collectionCoupoun.findByIdAndDelete(couponId);

        // Redirect to the coupon list page or send a success response
        res.redirect('/admin/coupoun');
        // Or send a JSON response if it's an API endpoint
        // res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        // Handle errors
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Coupon deletion failed: ' + error.message });
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

const BannerList = async(req,res)=>{
    try {
        

        // Fetch products from the database
        const BannerList = await collectionBanner.find({});
        
        // Render the product page with the fetched products
        res.render('admin/banner', { Banner: BannerList });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const AddBanner=async(req,res)=>{
    res.render('admin/AddBanner')
}

const AddBannerPost = async (req, res) => {
    try {
        // Extract title and image files from the request body
        const { bannername } = req.body;
        const imageFiles = req.files; // Assuming Multer middleware is used for file upload
        console.log(imageFiles);
        // Extract filenames from the uploaded files
        const imageUrl = imageFiles.map(file => file.path);

        // Create a new banner object
        const newBanner = new collectionBanner({
            bannername,
             imageUrl, // Array of image filenames
            status: 'active' // Default status
        });

        // Save the banner object to the database
        await newBanner.save();

        // Redirect or respond with success message
        res.redirect('/admin/banner'); // Redirect to the banners page or any other appropriate route
    } catch (error) {
        // Handle errors
        console.error('Error adding banner:', error);
        res.status(500).send('Error adding banner. Please try again.'); // Respond with an error message
    }
};

const DeleteBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        console.log("hrryt",bannerId);

        // Delete the banner from the database based on the provided bannerId
        await collectionBanner.findByIdAndDelete(bannerId);

        // Redirect back to the admin page or any other appropriate route
        res.redirect('/admin/banner');
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).send('Error deleting banner. Please try again.');
    }
};

const BlockBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const banner = await collectionBanner.findById(bannerId);

        // Toggle the status of the banner
        banner.status = banner.status === 'active' ? 'blocked' : 'active';
        await banner.save();

        // Redirect back to the admin page or any other appropriate route
        res.redirect('/admin/banner');
    } catch (error) {
        console.error('Error blocking/unblocking banner:', error);
        res.status(500).send('Error blocking/unblocking banner. Please try again.');
    }
};

// sales starts

// const sales = async(req, res) => {
//     try {
    
//         const orderList = await collectionOrder.find();
//         let salesReport= [];
//         orderList.forEach((item)=>{
//             item.products.forEach((productList)=>{

//                 salesReport.push({
//                     _id:productList._id,
//                     p_name:productList.p_name,
//                     quantity:productList.quantity,
//                     price:productList.realPrice,
//                     createdAt:item.createdAt,
//                 })
//             })
//         })

//         console.log("hjjhjh", salesReport);
        

//         // Render the admin/sales view with the sales report data
//         res.render('admin/sales', { salesReport });
//     } catch (error) {
//         console.error("Error generating sales report:", error);
//         res.status(500).send("Internal server error");
//     }
// };

const sales = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        let salesReport = [];

        // Add logic to construct MongoDB query based on the start and end dates
        let query = {};

        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.createdAt = { $lte: new Date(endDate) };
        }

        const orderList = await collectionOrder.find(query);

       
        orderList.forEach((item) => {
            item.products.forEach((productList) => {
                salesReport.push({
                    _id: productList._id,
                    p_name: productList.p_name,
                    quantity: productList.quantity,
                    price: productList.realPrice,
                    createdAt: item.createdAt,
                });
            });
        });

        req.session.salesReport = salesReport;

        // Render the admin/sales view with the filtered sales report data
        res.render('admin/sales', { salesReport });
        console.log(salesReport);
    } catch (error) {
        console.error("Error generating sales report:", error);
        res.status(500).send("Internal server error");
    }
};



// Function to generate the PDF
// Function to generate the PDF
const generatePDF = async (req, res) => {
    try {
        // Create a new PDF document
        const doc = new PDFDocument();

        // Ensure salesReport is an array before proceeding
        let salesReport = req.session.salesReport;

        if (!Array.isArray(salesReport)) {
            salesReport = [];
        }

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add content to the PDF document
        doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();

        // Loop through the sales report data and add rows to the PDF
        for (let i = 0; i < salesReport.length; i++) {
            const report = salesReport[i];

            // Format each row with proper spacing and alignment
            doc.fontSize(12).text(`Product ID: ${report._id}`, { align: 'left' }).moveDown();
            doc.fontSize(12).text(`Product Name: ${report.p_name}`, { align: 'left' }).moveDown();
            doc.fontSize(12).text(`Date: ${report.createdAt}`, { align: 'left' }).moveDown();
            doc.fontSize(12).text(`Quantity: ${report.quantity}`, { align: 'left' }).moveDown();
            doc.fontSize(12).text(`Price: ${report.price}`, { align: 'left' }).moveDown();

            // Move the starting point of the line downwards for spacing
            doc.moveTo(50, doc.y + 20)
               .lineTo(550, doc.y + 20)
               .stroke();

            // Add some space after each product except for the last one
            if (i !== salesReport.length - 1) {
                doc.moveDown(2); // Add 2 lines of space
            }
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
        const salesReport = req.body;
        console.log(salesReport);
        // Check if data is present and is an array
        if (!Array.isArray(salesReport) || salesReport.length === 0) {
            throw new Error('Data is empty or not an array');
        }

        // Create a new workbook and add a worksheet
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Define column headers and widths
        worksheet.columns = [
            { header: 'Product ID', key: 'productId', width: 15 },
            { header: 'Product Name', key: 'productName', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Total Quantity', key: 'totalQuantity', width: 15 },
            { header: 'Total Price', key: 'totalSales', width: 15 },
        ];

        // Add rows to the worksheet
        salesReport.forEach((item) => {
            worksheet.addRow({
                productId: item._id || '', // Adjust if necessary
                productName: item.p_name || '', // Adjust if necessary
                date: item.createdAt || '', // Adjust if necessary
                totalQuantity: item.quantity || 0, // Default to 0 if not provided
                totalSales: item.price || 0, // Default to 0 if not provided
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
        console.error('Error generating Excel:', error.message); // Log error message
        res.status(500).send('Internal Server Error: ' + error.message); // Send error message as response
    }
};


module.exports = {
    login,loginpost,logout,home,
    user,category,product,addcategory,addcategorypost,editcategory,update,deletecategory,isBlocked,notBlocked,addproduct,addproductpost,editproduct,editproductpost,deleteproduct,isdelete,notdelete,order,orderput,coupounsList,couponsAdding,couponCreation
    ,coupounDelete,deletImage,BannerList,AddBanner,AddBannerPost,DeleteBanner,BlockBanner,sales,generatePDF,downloadExcel
};
