const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//type: 
//1 - одновременно выполняется лишь один из критериев
//2 - одновременно могут выполняться несколько критериев
const kpiScheme = new Schema(
{
	name: String,
	section: String,  //раздел
	subtype: String,  //подраздел
	number: Number,  //номер
	type: {
		type: Number,
		default: 1
	},
	//в месяцах
	implementationPeriod: {
		type: Number,
		default: 6
	},
	description: String,
	indicatorsSumm: {
		type: Boolean,
		default: false
	},
	substrings: Array  //substrings:[] из {balls: Array, criterion: Array,  //два граничных значения
							//description: String, namecriterion: String,  //текст критерия
							//priority: Number  //приоритет
							//additIndicator: Number //дополнительный показатель
}, {versionKey: false});

const Kpi = mongoose.model("KPI", kpiScheme);
module.exports = Kpi;

//section: Образовательная деятельность, Научная деятельность, Репутационная деятельность