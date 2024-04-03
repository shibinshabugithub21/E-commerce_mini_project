const { render } = require("ejs");
const { sendEmail, sendforgetpassword } = require("../../middleware/nodeMailer");
const nodemailer = require("nodemailer");
const collectionModel = require("../../models/userdb");

// const coll =require('../models/userdb');
const collectionOtp = require("../../models/otp");
const collectionProduct = require("../../models/product");
const collectionOrder = require("../../models/order");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const collectionCoupoun = require("../../models/coupoun");
const BannerDB = require("../../models/bannerdb");
const collectionCat = require("../../models/category");

// iphone
// iphone controller
const products = async (req, res) => {
  try {
    const productList = await collectionProduct.find({ Category: "iphone", isDelete: true });
    const category = await collectionCat.find({ isBlocked: false });

    // Iterate over each product to check its stock
    const productWithStock = productList.map((product) => ({
      ...product.toObject(),
      errorMessage: product.Stock < 1 ? "The product is out of stock" : null,
    }));

    res.render("user/product.ejs", { product: productWithStock, category, errorMessage: null });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
};

const mac = async (req, res) => {
  const product = await collectionProduct.find({ Category: "mac", isDelete: true });
  const category = await collectionCat.find({ isBlocked: false });
  console.log("category", category);
  // Iterate over each product to check its stock
  const productWithStock = product.map((product) => ({
    ...product.toObject(),
    errorMessage: product.Stock < 1 ? "The product is out of stock" : null,
  }));

  res.render("user/mac.ejs", { product: productWithStock, category, errorMessage: null });
};

const airpod = async (req, res) => {
  const product = await collectionProduct.find({ Category: "airpods", isDelete: true });
  const category = await collectionCat.find({ isBlocked: false });
  // Iterate over each product to check its stock
  const productWithStock = product.map((product) => ({
    ...product.toObject(),
    errorMessage: product.Stock < 1 ? "The product is out of stock" : null,
  }));

  res.render("user/airpod.ejs", { product: productWithStock, category, errorMessage: null });
  // res.render('user/product.ejs', (err, html) => {
  //     if (err) {
  //         console.error(err.stack);
  //         res.status(500).send('Internal Server Error');
  //     } else {
  //         res.send(html);
  //     }
  // });
};

const watch = async (req, res) => {
  const product = await collectionProduct.find({ Category: "watch", isDelete: true });
  const category = await collectionCat.find({ isBlocked: false });
  // Iterate over each product to check its stock
  const productWithStock = product.map((product) => ({
    ...product.toObject(),
    errorMessage: product.Stock < 1 ? "The product is out of stock" : null,
  }));

  res.render("user/watch.ejs", { product: productWithStock, category, errorMessage: null });

  // res.render('user/product.ejs', (err, html) => {
  //     if (err) {
  //         console.error(err.stack);
  //         res.status(500).send('Internal Server Error');
  //     } else {
  //         res.send(html);
  //     }
  // });
};

const details = async (req, res) => {
  try {
    const productId = req.params.id;
    const category = await collectionCat.find({ isBlocked: false });
    const product = await collectionProduct.findById(productId);

    const recommendedProducts = await collectionProduct
      .find({
        Category: product.Category, // Filter by the same category
        _id: { $ne: productId }, // Exclude the current product
        isDelete: true,
      })
      .limit(4);
    // Check if the product is out of stock
    const errorMessage = product.Stock < 1 ? "The product is out of stock" : null;

    res.render("user/details", { product, category, recommendedProducts, errorMessage });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  products,
  details,
  mac,
  airpod,
  watch,
};
