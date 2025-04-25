const mongoose = require("mongoose");

const InstanceConfigWebhook = mongoose.model("instanceConfigWebhook", {
  instance: {
    type: String,
    require: true,
  },
  // status boolean
  status: {
    type: Boolean,
    require: true,
    default: false,
  },
  // url do webhook
  url: {
    type: String,
    require: true,
  },
  // webhook base64
  base64: {
    type: Boolean,
    require: true,
    default: false,
  },
  // lista de eventos
  events: {
    type: Array,
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

module.exports = InstanceConfigWebhook;
