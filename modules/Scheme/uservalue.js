const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uservalueScheme = new Schema(
{
	nameUser: String,
	nameKpi: String,
	value: Number,  //значение
	number: Number,
	date: Date,  //дата добавления значения
	startDate: Date,  //дата начала действия ПЭДа (реализации)
	finishDate: Date,  //дата окончания действия ПЭДа
	text: String,
	file: String,  //имя прикрепленного файла
	invalid : {  //пометка о недействительности ПЭДа
		type: Boolean,
		default: false
	},
	invalidInfo: { //информация о пометки недействительности
		author: String,
		text: String
	}
	//ball: Array  //Оценки
}, {versionKey: false});
const Uservalue = mongoose.model("Uservalue", uservalueScheme);
module.exports = Uservalue;