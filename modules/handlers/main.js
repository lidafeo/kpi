const bcrypt = require("bcrypt");

let DBs = require('../db/select.js');

let getInfoClose = require('./admin.js').getInfoClose;

//GET-запрос начальной страницы сайта
exports.home = function(req, res) {
	if(req.session.userName) 
		return res.redirect('/my-page');
	res.render("auth", {checkPassword: false, close: false});
};

//Аутентификация
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
			//req.session.numberGroup = result.number_group;
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
			let closeAccount = getInfoClose();
			if(closeAccount && result.func_pps)
				return res.render("auth", {checkPassword: false, close: true});

			res.redirect('/my-page');
		}
		else
			res.render("auth", {checkPassword: true, close: false});
	}).catch(err => {
		res.status(500).render('error/500');
	});
};

//проверка открытия кабинетов
exports.checkAccount = function(req, res, next) {
	//проверка доступа к личному кабинету
	let closeAccount = getInfoClose();
	if(closeAccount && req.session.rights.pps)
		return res.redirect("/exit");
	else next();
};

//проверка входа
exports.checkSession = function(req, res, next) {
	let name = req.session.userName;
	if(!name) return res.redirect('/');
	next();
};

//выход
exports.exit = function(req, res) {
	//очищаем данные сессии
	delete req.session.userName;
	delete req.session.userPosition;
	//delete req.session.numberGroup;
	delete req.session.level;
	delete req.session.department;
	delete req.session.faculty;
	delete req.session.rights;
	res.redirect('/');
};

//Отправка страницы 404
exports.notFound = function(req, res) {
	res.status(404).render('error/404');
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
				rej();
			});
		}).catch(err => {
			console.log(err);
			rej();
		});
	});
} 
