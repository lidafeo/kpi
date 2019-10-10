const fs = require("fs");
const bcrypt = require("bcrypt");

let DBs = require('../db/select.js');

let getclose = require('./admin.js').getclose;

exports.home = function(req, res) {
	if(req.session.userName) 
		return res.redirect('/mypage');
	res.render("auth", {checkpassword: false, close: false});
};

//authentication
exports.auth = function(req, res) {
	let login = req.body.login;
	let password = req.body.password;
	console.log("Попытка войти login:" + login);

	//проверяем login и password
	checkPassword(login, password).then(function(result) {
		if(result){
			//запоминаем данные сессии
			req.session.userName = result.name;
			req.session.login = result.login;
			req.session.userPosition = result.position;
			req.session.numberGroup = result.number_group;
			req.session.level = result.level;
			req.session.department = result.department;
			req.session.faculty = result.faculty;
			let rights = {};
			rights.pps = result.func_pps;
			rights.head = result.func_head;
			rights.admin = result.func_admin;
			rights.pfu = result.func_pfu;
			req.session.rights = rights;


			//проверка доступа к личному кабинету
			let closeAccount = getclose();
			if(closeAccount && req.session.userPosition != 'Администратор' && 
				req.session.userPosition != 'ПФУ')
				return res.render("auth", {checkpassword: false, close: true});

			res.redirect('/mypage');
		}
		else
			res.render("auth", {checkpassword: true, close: false});
	});
};

//проверка открытия кабинетов
exports.checkaccount = function(req, res, next) {
	//проверка доступа к личному кабинету
	let closeAccount = getclose();
	if(closeAccount && req.session.userPosition != 'Администратор' && 
		req.session.userPosition != 'ПФУ')
		return res.redirect("/exit");
	else next();
};

//проверка входа
exports.checksession = function(req, res, next) {
	let name = req.session.userName;
	if(!name) return res.redirect('/');
	next();
};

//выход
exports.exit = function(req, res) {
	//очищаем данные сессии
	delete req.session.userName;
	delete req.session.userPosition;
	delete req.session.numberGroup;
	delete req.session.level;
	delete req.session.department;
	delete req.session.faculty;
	delete req.session.rights;
	res.redirect('/');
};

//404
exports.notfound = function(req, res) {
	res.render('404');
}

//проверка введенного логина
function checkPassword(login, password) {
	return new Promise( function(res, rej) {
		DBs.selectUserWithPositionInfo(login).then(result => {
			if(result.length == 0)
				return res(false);
			bcrypt.compare(password, result[0].password).then(function(samePassword) {
				if(!samePassword) {
					res(false);
				}
				res(result[0]);
			}).catch(function(error) {
				console.log(error);
			});
		}).catch(err => {
			console.log(err);
		});
	});
} 
