const fs = require("fs");
const User = require("../Scheme/users.js");

let dateToString = require('../date.js').dateToString;
let timeToString = require('../date.js').timeToString;

exports.home = function(req, res) {
	if(req.session.userName) res.redirect('/mypage');
	res.render("auth", {checkpassword: false});
	//res.redirect(303, 'mypage');
};

//authentication
exports.auth = function(req, res) {
	let login = req.body.login;
	let password = req.body.password;
	console.log("login:" + login);
	console.log("password: " + password);
	//проверяем login и password
	checkPassword(login, password).then(function(result) {
		if(result){
			//запоминаем данные сессии
			req.session.userName = result.name;
			req.session.userPosition = result.position;
			req.session.positionNumber = result.positionNumber;
			req.session.level = result.level;
			req.session.department = result.department;
			req.session.faculty = result.faculty;
			if(!(result.positionNumber + 1))
				req.session.role = "user";
			else req.session.role = result.position;
			//записываем логи
			let date = new Date();
			let strTime = timeToString(date);
			let namefile = dateToString(date) + '.txt';
			fs.appendFileSync("./logs/" + namefile, strTime + " " + result.name +
				" зашел(а) в личный кабинет;\r\n");
			res.redirect('/mypage');
		}
		else
			res.render("auth", {checkpassword: true});
	});
};

//проверка входа
exports.checksession = function(req, res, next) {
	let name = req.session.userName;
	if(!name) return res.redirect('/');
	next();
};

//выход
exports.exit = function(req, res) {
	req.session.userName = "";
	req.session.userPosition = "";
	req.session.positionNumber = "";
	req.session.level = "";
	req.session.department = "";
	req.session.faculty = "";
	res.redirect('/');
};

//проверка введенного логина
function checkPassword(login, password) {
	return new Promise( function(res, rej) {
		User.findOne({login: login}, function(err, user) {
			if(err) console.log(err);
			let result;
			if(user == null || password != user.password)
				result = false;
			else result =  user;
			res(result);
		});
	});
} 
