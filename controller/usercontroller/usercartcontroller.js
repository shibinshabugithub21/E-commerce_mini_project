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

//cart details
const DELIVERY_FEE = 10; 
const loadcart = async (req, res) => {
  try {
    const userEmail = req.session.user;
    console.log(userEmail); // Get the user's email from the session
    const category = await collectionCat.find({ isBlocked: false });

    const user = await collectionModel.findOne({ email: userEmail }).populate("cart.items.productname");

    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }
    const deliveryFee = DELIVERY_FEE;
    const cartItems = user.cart.items;
    const grantTotal = user.cart.grantTotal + deliveryFee;
    // Render the cart view with the fetched data
    res.render("user/cart", { user, cartItems, grantTotal: grantTotal, deliveryFee, category });
  } catch (error) {
    console.error("Error loading cart:", error);
    res.status(500).render("error", { message: "An error occurred while loading the cart." });
  }
};

const Addcart = async (req, res) => {
  try {
    const id = req.params.id;
    const userEmail = req.session.user;
    const user = await collectionModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await collectionProduct.findById(id);

    if (!product) {
      // Handle the case where the product doesn't exist
      return res.status(404).json({ message: "Product not found" });
    }

    const unitprice = product.OriginalPrice;

    // Ensure unitprice is a valid number
    if (isNaN(unitprice) || unitprice <= 0) {
      // Handle the case where unitprice is not a valid number
      return res.status(400).json({ message: "Invalid unit price" });
    }

    const cartItems = user.cart.items;
    const existingCartItemIndex = cartItems.findIndex((item) => item.productname.toString() === id);

    if (existingCartItemIndex !== -1) {
      cartItems[existingCartItemIndex].quantity += 1;

      // Update totalprice only if unitprice is a valid number
      if (!isNaN(cartItems[existingCartItemIndex].quantity) && cartItems[existingCartItemIndex].quantity > 0) {
        cartItems[existingCartItemIndex].totalprice = cartItems[existingCartItemIndex].quantity * unitprice;
      }
    } else {
      const newCartItem = {
        productname: id,
        quantity: 1,
        totalprice: unitprice,
      };
      user.cart.items.push(newCartItem);
    }
    user.cart.grantTotal = user.cart.items.reduce((total, item) => total + item.totalprice, 0);
    await user.save();

    const cartItemsCount = user.cart.items.length;

    // Return the updated user object or any other response as needed
    // return res.status(200).json({ message: 'Cart updated successfully', cartItemsCount });
  } catch (error) {
    console.error("Error from Addcart:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const cartQuantityUpdate = async (req, res) => {
  try {
    const cartId = req.params.id;
    const quantity = req.body.quantity;
    const userEmail = req.session.user;

    // Find the user details
    const userDetails = await collectionModel.findOne({ email: userEmail });

    // Find the cart item corresponding to the provided ID
    const cartItem = userDetails.cart.items.find((item) => item.productname == cartId);

    // Find the product details from the product collection
    const product = await collectionProduct.findById(cartId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the requested quantity exceeds the available stock
    if (quantity > product.Stock) {
      // If quantity exceeds stock, return a client-side alert
      return res.status(400).json({
        error: "Requested quantity exceeds available stock",
        showAlert: true,
        alertMessage: "The product is out of stock now.",
      });
    }

    // Update the cart item quantity and total price
    cartItem.quantity = quantity;
    cartItem.totalprice = product.OriginalPrice * quantity;

    // Recalculate grantTotal and total
    userDetails.cart.grantTotal = userDetails.cart.items.reduce((accu, element) => accu + element.totalprice, 0);
    const totalAmount = userDetails.cart.grantTotal;

    // Save the changes to the user details
    await userDetails.save();

    res.json({ grantTotal: userDetails.cart.grantTotal, totalAmount });
  } catch (error) {
    console.error("Error from the cartQuantityUpdate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const cartDelete = async (req, res) => {
  try {
    // Get the item ID from the request parameters
    const deletecart = req.params.id;
    // Get the user's email from the session
    const userEmail = req.session.user;

    // Find the user and remove the cart item
    const user = await collectionModel.findOneAndUpdate(
      { email: userEmail },
      { $pull: { "cart.items": { productname: deletecart } } },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Recalculate grantTotal
    user.cart.grantTotal = user.cart.items.reduce((total, item) => total + item.totalprice, 0);
    await user.save();

    // Send a success response
    res.sendStatus(200);
  } catch (error) {
    console.error("Error from cartDelete:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loadcart,
  Addcart,
  cartQuantityUpdate,
  cartDelete,
};
