const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var userSchema = new Schema({
    "account": String,
    "password": String,
    "fullname": String
});

const Users = mongoose.model("users", userSchema);

module.exports = Users;
