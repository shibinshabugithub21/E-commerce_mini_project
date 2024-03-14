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

const addproduct =async (req, res) => {
    // Check if the user is authenticated
    
    const categories = await collectionCat.find({isBlocked:false});
console.log(categories);

    const errorMessage = req.flash('error');
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    res.render('admin/addproduct',{errorMessage:errorMessage,categories});
};


const addproductpost = async (req, res) => {
    try {
        const files = req.files;

        const Productname = req.body.productName;
        const Category = req.body.Category;
        const Stock = parseInt(req.body.stock);
        const Rating = parseFloat(req.body.rating);
        const OriginalPrice = parseFloat(req.body.price); 
        const OfferPercentage = parseFloat(req.body.offer); 
        const Price = OriginalPrice - (OriginalPrice * (OfferPercentage / 100)); 
        const Description = req.body.description;

        const data = {
            Productname: Productname,
            Category: Category,
            Stock: Stock,
            Rating: Rating,
            OriginalPrice:Price ,
            OfferPercentage: OfferPercentage,
            Price: OriginalPrice,
            Description: Description,
            Image: files.map(file => file.filename)
        };

        const newProduct = await collectionProduct.insertMany([data]);

        console.log("New product successfully added:", newProduct);
        
        // Fetch all products again after adding the new one
        const products = await collectionProduct.find({});
        
        // Render the product page with the updated product list
        res.render('admin/product', { product: products });
    } catch (error) {
        console.error("Error during adding:", error);
        res.status(500).send("Internal server error");
    }
};


const editproduct = async(req,res)=>{


    try {
        const productId = req.params.id;

        const element = await collectionProduct.findById(productId);

        res.render('admin/editproduct',{element});

    } catch (error) {
        console.log(error)
    }
}

const editproductpost = async(req,res)=>{

    console.log("Editproduct")
    try {
        const productId =req.params.id;
        // console.log("hello",productId);
        const image = req.files;
        const products = await collectionProduct.findById(productId);

        if(!productId){
            return res.status(404).send("priduct not found");
        }
            products.Productname = req.body.productName;  
            products.Category = req.body.category;
            products.Stock= req.body.stock;
            products.Rating= req.body.rating;
            products.Price =req.body.discountedPrice;
            products.OfferPercentage=req.body.offer
            products.OriginalPrice=req.body.price
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

module.exports={
    product,addproduct,addproductpost,editproduct,editproductpost,deleteproduct,isdelete,notdelete, deletImage,

}