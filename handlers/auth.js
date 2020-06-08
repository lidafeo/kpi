const bcrypt = require("bcrypt");

let DB = require('../modules/db');

let getClose = require('../modules/period').getObjClose;
let setNotify = require('../modules/period.js').setNotify;

let writeErrorLogs = require('../modules/logs').error;

//GET-запрос начальной страницы сайта
exports.pageHome = function(req, res) {
	if(req.session.name)
		return res.redirect('/my-page');
	res.render("auth");
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
			req.session.name = result.name;
			req.session.login = result.login;
			req.session.role = result.role;
			req.session.position = result.position;
			req.session.level = result.level;
			req.session.department = result.department;
			req.session.faculty = result.faculty;
			DB.rightsRoles.selectRightsRolesByRole(result.role).then(resultRights => {
				let rights = [];
				for(let i = 0; i < resultRights.length; i++) {
					rights.push(resultRights[i].right_name);
				}
				req.session.rights = rights;

				//проверка доступа к личному кабинету
				let closeAccount = getClose();
				if(closeAccount && result.position)
					return res.json({err: 'Доступ к личным кабинетам временно закрыт'});

				res.json({result: 'ok'});
			}).catch(err => {
				res.status(500).render('error/500');
			});
		} else {
			res.json({err: 'Неправильно введен логин или пароль'});
		}
	}).catch(err => {
		writeErrorLogs('error auth', err);
		console.log(err);
		res.status(500).render('error/500');
	});
};

//проверка открытия кабинетов
exports.checkOpenAccount = function(req, res, next) {
	//проверка доступа к личному кабинету
	let closeAccount = getClose();
	if(closeAccount && req.session.position)
		return res.redirect("/exit");
	else next();
};

//проверка входа
exports.checkSession = function(req, res, next) {
	let name = req.session.name;
	if(!name) return res.redirect('/');
	next();
};

//выход
exports.exit = function(req, res) {
	//очищаем данные сессии
	delete req.session.name;
	delete req.session.role;
	delete req.session.position;
	delete req.session.level;
	delete req.session.department;
	delete req.session.faculty;
	delete req.session.rights;
	res.redirect('/');
};

//главная страница пользователя
exports.myPage = function(req, res) {
	let rights = req.session.rights;
	if(rights.indexOf('get_my_score') !== -1) {
		return res.redirect('/pps/get-my-score');
	}
	if(rights.indexOf('verify') !== -1) {
		return res.redirect('/verify');
	}
	if(rights.indexOf('get_actions_users') !== -1) {
		return res.redirect('/get-actions-users');
	}
	if(rights.indexOf('create_report') !== -1) {
		return res.redirect('/pfu');
	}
	return res.redirect('/actions');
};

//проверка введенного логина
function checkPassword(login, password) {
	return new Promise( function(res, rej) {
		DB.users.selectUserByLogin(login).then(result => {
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
