
const collectionModel = require("../../models/userdb");

// const coll =require('../models/userdb');
const collectionOtp = require("../../models/otp");
const collectionProduct = require("../../models/product");
const collectionOrder = require("../../models/order");
const bcrypt = require("bcrypt");
const BannerDB = require("../../models/bannerdb");
const collectionCat = require("../../models/category");

const landing = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    let product;

    if (searchQuery) {
      product = await collectionProduct.find({
        $and: [
          { isDelete: true },
          {
            $or: [
              { Productname: { $regex: searchQuery, $options: "i" } },
              { Category: { $regex: searchQuery, $options: "i" } },
            ],
          },
        ],
      });
    } else {
      product = await collectionProduct.find({ isDelete: true });
    }
    const category = await collectionCat.find({ isBlocked: false });

    if (req.session.user) {
      console.log("landing page ", req.session.user);
      res.redirect("/home");
    } else {
      res.render("user/landing", { product, searchQuery, category });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const login = (req, res) => {
  console.log("req.session.user", req.session.user);
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.render("user/login.ejs");
  }
};

const loginpost = async (req, res) => {
  console.log("login post ", req.body);
  try {
    const check = await collectionModel.findOne({ email: req.body.email });
    console.log("checkid", check);

    const data = await bcrypt.compare(req.body.password, check.password);
    if (data) {
      //auth for login
      req.session.user = check.email; //session creation
      req.session.userid = check._id;
      console.log("user login post", req.session.user);
      res.redirect("/home");
    } else {
      // res.send("Wrong Password")
      res.render("user/login.ejs", { mes: "Incorrect Password" });
    }
  } catch (error) {
    res.render("user/login.ejs", { mes: "Incorrect Email" });
  }
};

const signup = (req, res) => {
  if (req.session.userid) {
    res.redirect("/home");
  } else {
    if (req.session.otpGerner) {
      res.redirect("/otp");
    }

    res.render("user/signup.ejs");
  }
};

let referral;
let referredUser;
let referred = "false";
// Function to generate a referral code
const generateReferralCode = (length) => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
};

const signuppost = async (req, res) => {

  const referralCode = generateReferralCode(8); // Change the length as needed
  console.log("referralCode", referralCode);

  if (req.body.referralCode) {
    referral = req.body.referralCode;
    referredUser = await collectionModel.findOne({ referralCode: referral });
  

    if (referredUser) {
      referred = "true";
    } else {
      return res.status(400).json({ success: false, message: "Referral code not found" });
    }
  }

  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    repassword: req.body.repassword,
    phone: req.body.phone,
    referralCode: referralCode,
    walletbalance: referredUser ? 50 : 0,
  };

  const newdata = await bcrypt.hash(data.password, 10);

  const datahash = {
    name: req.body.name,
    email: req.body.email,
    password: newdata,
    repassword: req.body.repassword,
    phone: req.body.phone,
    referralCode: referralCode,
    walletbalance: referredUser ? 50 : 0,
  };

  console.log(newdata);
  console.log("sign");

  const existinUser = await collectionModel.findOne({ email: data.email });
  console.log("alredy exist user");

  const randome = Math.floor(Math.random() * 90000) + 10000;
  const newOtp = await collectionOtp.create({ number: randome, email: data.email });

  if (existinUser) {
    res.render("user/signup", { status: true, mes: "user all ready exists" });
  } else {
    await collectionModel.insertMany([datahash]);
    req.session.otpGerner = data;
    console.log(data);
    console.log("here in the signup true");
    sendEmail(randome, req.body.email);

    res.redirect("/otp");
  }
};

const forget = async (req, res) => {
  res.render("user/forgetemail");
};

const forgetpost = async (req, res) => {
  const email = req.body.email;

  if (!validateEmail(email)) {
    return res.status(400).send("Invalid email address");
  }

  const resetToken = generateOtp();
  const otpDoc = await collectionOtp.create({
    email,
    number: resetToken,
  });

  sendforgetpassword(otpDoc._id, req.body.email)
    .then(() => {
      // res.send('Reset page sent to youril!');
      res.render("user/forgetemail");
    })
    .catch((error) => {
      console.error("Error sending reset email:", error);
      res.status(500).send("Failed to send reset page. Please try again later.");
    });
  // Validate email address
  function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(String(email).toLowerCase());
  }

  // Generate reset token
  function generateResetToken() {
    return Math.random().toString(36).substr(2);
  }

  function generateOtp() {
    return Math.floor(Math.random() * 5000000);
  }
};

const forgetPassword = async (req, res) => {
  console.log(req.params);
  const token = req.params.token;
  const otpDoc = await collectionOtp.findById(token);
  if (!otpDoc) {
    res.status(402).send("Invalid token");
    return;
  }
  res.render("user/forget", { email: otpDoc.email });
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const email = req.params.email;
    // Find the user by ID
    const user = await collectionModel.findOne({ email });
    console.log(user);

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match" });
    }
    console.log(newPassword);
    const newpass = await bcrypt.hash(newPassword, 10);
    user.password = newpass;
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const otp = (req, res) => {
  if (req.session.otpGerner) {
    res.render("user/otp", { error: null });
  } else {
    res.redirect("/login");
  }
};

const otppost = async (req, res) => {
  try {
    const num1 = req.body.num1 || "";
    const num2 = req.body.num2 || "";
    const num3 = req.body.num3 || "";
    const num4 = req.body.num4 || "";
    const num5 = req.body.num5 || "";

    if (!num1 || !num2 || !num3 || !num4 || !num5) {
      return res.status(400).render("user/otp", { error: "Please enter all the OTP digits" });
    }

    const isNumber = parseInt(num1 + num2 + num3 + num4 + num5);
    console.log(typeof isNumber);
    const result = await collectionOtp.findOne({ number: isNumber });

    if (referred === "true") {
      await collectionModel.updateOne({ referralCode: referral }, { $inc: { walletbalance: 100 } });
      console.log("Wallet updated");
    }

    if (result) {
      console.log(req.session.otpGerner);
      req.session.user = req.session.otpGerner.email;
      delete req.session.otpGerner;
      return res.redirect("/home");
    } else {
      return res.status(400).render("user/otp", { error: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.log(error.message);
    const message = error.message;
    res.status(500).render("404-error", { error, message });
  }
};


//resend otp

const resendOtp = async (req, res) => {
  try {
    let randomOTP = Math.floor(Math.random() * 9000) + 10000;
    console.log("This is your resend OTP:", randomOTP);
    let entrie = 0;
    const newUser = new collectionOtp({
      number: randomOTP,
      email: req.session.otpGerner.email, // Assuming req.session.otpGerner.email holds the email
    });

    await newUser.save();
    console.log(req.session.otpGerner.email);
    sendEmail(randomOTP, req.session.otpGerner.email);
    console.log("rtyuio");
    res.render("user/otp", { error: null });
  } catch (error) {
    console.log("Error generating OTP:", error);
    res.status(500).send("OTP error");
  }
};

const home = async (req, res) => {
  console.log(req.url);
  try {
    const username = req.session.userid;
    const searchQuery = req.query.search || "";
    const categoryQuery = req.query.category || "";
    const category = await collectionCat.find({ isBlocked: false });
    let productQuery = { isDelete: true };
    if (searchQuery) productQuery.Productname = { $regex: searchQuery, $options: "i" };

    const banner = await BannerDB.find({ status: "active" });
    const product = await collectionProduct.find(productQuery);
    const user = await collectionModel.findOne({ _id: username });
    if (user) {
      res.render("user/home", {
        product,
        user: req.session.useremail,
        searchQuery,
        categoryQuery,
        banner,
        category,
        wishlist: user.wishlist,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log("Error in the home route:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
const logout = (req, res) => {
  req.session.destroy((err) => {
    console.log("req.session logout", req.session);
    if (err) {
      console.error("Error destroying session:", err);
    }
  });
  res.redirect("/login");
};

module.exports = {
  landing,
  login,
  loginpost,
  signuppost,
  home,
  logout,
  signup,
  otp,
  otppost,
  resendOtp,
  forget,
  forgetpost,
  forgetPassword,
  resetPassword,
};
