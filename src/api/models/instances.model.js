const { string } = require("joi");
const mongoose = require("mongoose");

const Instances = mongoose.model("instances", {
  name: {
    type: String,
    require: true,
  },
  // numero contecado atual
  phoneIdConnected: {
    type: String,
  },
  messagesSendCount: {
    type: Number,
    default: 0,
  },
  key: {
    type: String,
    unique: true,
    require: true,
  },
  token: {
    type: String,
    unique: true,
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

module.exports = Instances;
