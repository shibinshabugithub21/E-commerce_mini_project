// Example Banner Schema (MongoDB)
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  bannername: { type: String, required: true },
  imageUrl: [{ type: String, required: true }],
  status: {
    type: String,
    enum: ["active", "blocked"], // Add 'blocked' as a valid enum value
    default: "active",
  },
});

const BannerDB = mongoose.model("Banner", schema);

module.exports = BannerDB;
