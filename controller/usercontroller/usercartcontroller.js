
const collectionModel = require("../../models/userdb");
const collectionProduct = require("../../models/product");
const collectionOrder = require("../../models/order");
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
    const grantTotal = user.cart.grantTotal;
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
      return res.status(400).json({ message: "Invalid unit price" });
    }

    const cartItems = user.cart.items;
    const existingCartItemIndex = cartItems.findIndex((item) => item.productname.toString() === id);

    if (existingCartItemIndex !== -1) {
      cartItems[existingCartItemIndex].quantity += 1;
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

    const userDetails = await collectionModel.findOne({ email: userEmail });

    const cartItem = userDetails.cart.items.find((item) => item.productname == cartId);

    const product = await collectionProduct.findById(cartId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (quantity > product.Stock) {
      return res.status(400).json({
        error: "Requested quantity exceeds available stock",
        showAlert: true,
        alertMessage: "The product is out of stock now.",
      });
    }

    cartItem.quantity = quantity;
    cartItem.totalprice = product.OriginalPrice * quantity;

    userDetails.cart.grantTotal = userDetails.cart.items.reduce((accu, element) => accu + element.totalprice, 0);
    const totalAmount = userDetails.cart.grantTotal;

    await userDetails.save();

    res.json({ grantTotal: userDetails.cart.grantTotal, totalAmount });
  } catch (error) {
    console.error("Error from the cartQuantityUpdate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const cartDelete = async (req, res) => {
  try {
    const deletecart = req.params.id;
    const userEmail = req.session.user;
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
