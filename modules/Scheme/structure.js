const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const structureScheme = new Schema(
{
	faculty: String,  //факультет
	department: Array //кафедры
}, {versionKey: false});

const Structure = mongoose.model("Structure", structureScheme);
module.exports = Structure;
