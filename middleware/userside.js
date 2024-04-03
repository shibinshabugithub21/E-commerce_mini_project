const collectionModel = require("../models/userdb");

const checkSessionAndBlocked = async (req, res, next) => {
  try {
    // Check if session exists
    console.log("check session", req.session.user);
    if (req.session.user) {
      const userDetials = await collectionModel.findOne({ email: req.session.user });

      // Check if user is blocked
      if (!userDetials.isBlocked) {
        // User is not blocked, proceed to the next middleware or route handler
        req.session.userid = userDetials._id;
        next();
      } else {
        // Admin is blocked, destroy session and redirect to landing page
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session: ", err);
          }
          res.redirect("/");
        });
      }
    } else {
      // Session doesn't exist, redirect to landing page
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error checking session and blocked status:", error);
    res.status(500).send("Internal Server Error middle");
  }
};

const isUser = (req, res, next) => {
  if (req.session.userid) {
    next();
  } else {
    res.redirect("/login");
  }
};

module.exports = { isUser, checkSessionAndBlocked };
