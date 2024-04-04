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



const BannerList = async(req,res)=>{
    try {
        

        // Fetch products from the database
        const BannerList = await BannerDB.find({});
        
        // Render the product page with the fetched products
        res.render('admin/Banner', { Banner: BannerList });
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
        const { bannername } = req.body;
        const imageFiles = req.files; 
        console.log(imageFiles);
        // Extract filenames from the uploaded files
        const imageUrl = imageFiles.map(file => file.path);

        // Create a new banner object
        const newBanner = new BannerDB({
            bannername,
             imageUrl, // Array of image filenames
            status: 'active' // Default status
        });

        await newBanner.save();

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
        await BannerDB.findByIdAndDelete(bannerId);

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
        const banner = await BannerDB.findById(bannerId);

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

module.exports={
    BannerList,AddBanner,AddBannerPost,DeleteBanner,BlockBanner
}