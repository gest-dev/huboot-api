import mongoose from 'mongoose';

const Contact = mongoose.model("contacts", {
  name: {
    type: String,
    require: true,
  },
  notify: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  phone_id: {
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

export default Contact;
