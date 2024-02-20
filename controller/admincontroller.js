const collectionModel = require('../models/mongodb');
const collectionCat=require('../models/category');
const collectionProduct = require('../models/product');
const { products } = require('./usercontroller');
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


const addcategory=(req,res)=>{
    res.render('admin/addcategory',{status:true,mes: ""})
}

const addcategorypost = async (req, res) => {
    try {
        const category = req.body.category;
        console.log(category, "admin side category");

        const existingCategory = await collectionCat.findOne({ Category: req.body.category });
        console.log(existingCategory)



        if (!existingCategory) {
            const insertingObject = {
                Category: category,
            };
            const newCategory = await collectionCat.insertMany([insertingObject]);

            console.log("New category successfully added:", newCategory);

            // res.render('admin/category',{category})
            res.status(201).json({ mes: "success" });
        } else {
            console.log(" item is existed in ");
            console.log("Error: Category already exists");
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
        const image = req.files;
        console.log(req.image, req.files, req.file)
        const products = await collectionProduct.findById(productId);

        if(!productId){
            return res.status(404).send("priduct not found");
        }

            products.Productname = req.body.productName;  // Use the correct case
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
        // Get the username from the query parameters
        const productId =req.params.id;
        console.log(req.params.id);

        // Update the user's record in the database to set isblocked to true
        let nproduct = await collectionProduct.updateOne({ _id:productId }, { $set: { isDelete: true } });
          console.log();

        // Redirect back to the user management page
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

module.exports = {
    login,loginpost,logout,home,user,category,product,addcategory,addcategorypost,editcategory,update,deletecategory,isBlocked,notBlocked,addproduct,addproductpost,editproduct,editproductpost,deleteproduct,isdelete,notdelete
};
