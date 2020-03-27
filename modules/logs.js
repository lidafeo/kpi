const fs = require("fs");
let dateToString = require('./date.js').dateToString;
let timeToString = require('./date.js').timeToString;
exports.log = function(user, level, action) {
	let date = new Date();
	let strTime = timeToString(date);
	let namefile = dateToString(date) + '.log';
	if(level == 10) {
		fs.appendFileSync("./log/admin/" + namefile, strTime + " " + user + " " + action + ";\r\n");
	}
	else {
		fs.appendFileSync("./log/user/" + namefile, strTime + " " + user + " " + action + ";\r\n");
	}
};
exports.error = function(user, error) {
	let date = new Date();
	let strTime = timeToString(date);
	let namefile = dateToString(date) + '.log';
	fs.appendFileSync("./log/error/" + namefile, strTime + " " + user + " " + error + ";\r\n");
};