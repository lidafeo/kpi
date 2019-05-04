const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userScheme = new Schema(
{
	name: String,
	position: String,
	department: String,  //кафедра
	faculty: String,  //факультет
	login: String,
	password: String,
	level: Number,
	positionNumber: Number
}, {versionKey: false});
const User = mongoose.model("Worker", userScheme);
module.exports = User;