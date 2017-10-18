var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');


var userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    token: { type: String, select: false },
    description:   { type: String, default: "Hello world" },
    avatar:   { type: String, default: "img/avatars/racoon.png" },
    email:   { type: String, required: true, select: false },
    phone: { type: String }
})

userSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('userModel', userSchema);
