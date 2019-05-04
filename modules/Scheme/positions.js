const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const positionScheme = new Schema(
{
	position: String,
	positionNumber: Number,
	level: Number
}, {versionKey: false});
const Position = mongoose.model("Position", positionScheme);
module.exports = Position;