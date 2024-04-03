const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    createdAT: { type: Date, default: Date.now, index: { expires: 60 } },
  },
  { timestamps: true }
);

const collectionOtp = mongoose.model("Otp", schema);
module.exports = collectionOtp;
