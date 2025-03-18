// This file defines the user model for the backend, including schema and methods.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to compare password
userSchema.methods.comparePassword = function(password) {
    // Logic to compare password
};

const User = mongoose.model('User', userSchema);

module.exports = User;