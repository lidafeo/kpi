const fs = require("fs");
let dateToString = require('./date.js').dateToString;
let timeToString = require('./date.js').timeToString;
module.exports = function(user, action) {
	let date = new Date();
	let strTime = timeToString(date);
	let namefile = dateToString(date) + '.log';
	fs.appendFileSync("./log/" + namefile, strTime + " " + user + " " + action + ";\r\n");
}