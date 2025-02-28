const mongoose = require("mongoose");

const Groups = mongoose.model("groups", {
  name: {
    type: String,
    require: true,
  },
  group_id: {
    type: String,
    require: true,
  },
  instance: {
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

module.exports = Groups;
