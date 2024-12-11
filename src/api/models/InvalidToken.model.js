const mongoose = require("mongoose");

const InvalidToken = mongoose.model("InvalidToken", {
  token: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = InvalidToken;
