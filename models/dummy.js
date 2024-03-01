const mongoose = require('mongoose');

const dummySchema = new mongoose.Schema({
    email : String,
    name : String
})

module.exports = mongoose.model('dummy', dummySchema);