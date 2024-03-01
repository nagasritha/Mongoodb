const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt : {type: Number, default: Date.now}
  });
  
  // Create a Mongoose model based on the schema
module.exports = mongoose.model('User', userSchema);