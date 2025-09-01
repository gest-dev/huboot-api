import mongoose from "mongoose";

const User = mongoose.model("users", {
  fullname: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    require: true,
  },
  status: String,
  avatar: String,
  lastAuthToken: String,
  lastAuthDate: Date,
  lastAccessAt: {
    type: Date,
  },
  blockAccess: Boolean,
  password: {
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

export default User;
