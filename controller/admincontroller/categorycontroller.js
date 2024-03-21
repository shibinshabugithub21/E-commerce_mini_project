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


const category = async (req, res) => {
    try {
        
        const categoryList = await collectionCat.find({});
        
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
        const { category, offer } = req.body;
        const lowercaseCategory = category.trim().toLowerCase();

        const existingCategory = await collectionCat.findOne({ Category: lowercaseCategory });

        if (!existingCategory) {
            const newCategory = new collectionCat({
                Category: lowercaseCategory,
                Offer: offer,
                isBlocked: false // Assuming the category is not blocked by default
            });

            await newCategory.save();
            
            console.log("New category successfully added:", newCategory);
            res.status(201).json({ mes: "success" });
        } else {
            console.log("Category already exists");
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
        const Category = await collectionCat.findById(editcat);
        console.log(Category)
        res.render("admin/editcategory", { Category });
    } catch (error) {
        console.log(error);
    }
};

// const update = async (req, res) => {
//     try {
//         const categoryId = req.params.id;
//         const newName = req.body.name;

//         const category = await collectionCat.findById(categoryId);
//         console.log(newName)

//         if (category) {
//             if (newName.trim() !== "") {
//                 category.Category = newName;
//                 await category.save();  // Correct way to save changes
//                 res.redirect('/admin/category');
//             } else {
//                 console.log("Error: New name cannot be empty");
//                 res.status(400).send("New name cannot be empty");
//             }
//         } else {
//             console.log("Error: Category not found");
//             res.status(404).send("Category not found");
//         }
//     } catch (error) {
//         console.error("Error during update:", error);
//         res.status(500).send("Internal server error");
//     }
// };

const update = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const newName = req.body.name;
        const newOffer = req.body.offer; // Get the new offer value from the request body

        const category = await collectionCat.findById(categoryId);
        console.log(newName, newOffer);

        if (category) {
            if (newName.trim() !== "") {
                category.Category = newName;
                category.Offer = newOffer; // Update the offer value
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

const blockCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await collectionCat.findById(categoryId);

        if (!category) {
            return res.status(404).send("Category not found");
        }

        category.isBlocked = true;
        await category.save();

        res.redirect('/admin/category');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const unblockCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await collectionCat.findById(categoryId);

        if (!category) {
            return res.status(404).send("Category not found");
        }

        category.isBlocked = false;
        await category.save();

        res.redirect('/admin/category');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// catgory ends
module.exports={
    category,addcategory,addcategorypost,editcategory,update,deletecategory,blockCategory,unblockCategory
}