const mongoose = require('mongoose');

const loggedinTableSchema = new mongoose.Schema({
    email : {
        type: String,
        required : true,
        unique :true
    },
    register_date: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('LoggedinUsers',loggedinTableSchema);