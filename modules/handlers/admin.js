const fs = require("fs");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const xlsx = require("xlsx");

//функции работы с БД
let DBs = require('../db/select.js');
let DBi = require('../db/insert.js');
let DBd = require('../db/delete.js');
let DBu = require('../db/update.js');

let dateModule = require('../date.js');
let writeLogs = require('../logs');
let additFunc = require('../additional');

let BCRYPT_SALT_ROUNDS = 12;

//доступ к личным кабинетам
let close = false;

exports.getInfoClose = function() {
	return close;
}

//текущий период отчета
let objPeriod = {
	set: false,
	notify: false,
	deletePeriod: function() {
		this.set = false;
	},
	setDate: function(date1, date2) {
		this.date1 = date1;
		this.date2 = date2;
		let date_1 = new Date(date1);
		let date_2 = new Date(date2);
		this.date1Str = (date_1.getDate() < 10 ? '0' + date_1.getDate() : date_1.getDate()) + "." 
			+ ((date_1.getMonth() + 1) < 10 ? '0' + (date_1.getMonth() + 1) : (date_1.getMonth() + 1)) 
				+ '.' + date_1.getFullYear();
		this.date2Str = (date_2.getDate() < 10 ? '0' + date_2.getDate() : date_2.getDate()) + "." 
			+ ((date_2.getMonth() + 1) < 10 ? '0' + (date_2.getMonth() + 1) : (date_2.getMonth() + 1)) 
				+ '.' + date_2.getFullYear();
		this.set = true;
	}
};

//на экспорт
exports.getObjPeriod = function() {
	return objPeriod;
}

//проверка прав администратора
exports.checkRightsAdmin = function(req, res, next) {
	if(req.session.level != 10) return res.status(404).render("error/404");
	else next();
}

//GET-запрос страницы со списком пользователей
exports.getUsers = function(req, res) {
	DBs.selectAllUsers().then(users => {
		res.render('admin/users/page_table_users', {users: users});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
	
}

//GET-запрос страницы для добавления сотрудника
exports.addUser = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllPosition().then(pos => {
		DBs.selectStructure().then(structure => {

			let facultyArr = additFunc.getFaculty(structure);
			let departmentArr = additFunc.getDepartment(facultyArr[0], structure);
			
			res.render('admin/users/page_add_user', {positions: pos, action: action, faculty: facultyArr, 
				department: departmentArr});
		}).catch(err => {
			console.log(err);
			res.status(500).render('error/500');
		});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//GET-запрос страницы добавления сотрудников с файла
exports.addUsersFromFile = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	res.render('admin/users/page_add_users_from_file', {action: action});
};

//GET-запрос страницы удаления сотрудника
exports.deleteUser = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllUsers().then(users => {
		res.render('admin/users/page_delete_user', {users: users, action: action});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//GET-запрос страницы получения списка ПЭД
exports.getKpi = function(req, res) {
	DBs.selectAllKpiWithCriterion().then(result => {
		let section = [];
		let kpi = [];
		let positions = [];

		for(let i = 0; i < result.length; i++) {
			let name = result[i].name;
			let arr = [];
			while (i != result.length && name == result[i].name) {
				arr.push(result[i]);
				i++;
			}
			i--;
			let oneKpi = getKpiObj(arr, positions);
			if(section.indexOf(oneKpi.section) == -1) {
				section.push(oneKpi.section);
				kpi.push([]);
			}
			kpi[section.indexOf(oneKpi.section)].push(oneKpi);
		}
		res.render('admin/kpi/page_table_kpi', {kpi: kpi, positions: positions});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
}

//GET-запрос страницы добавления одного ПЭД
exports.addKpi = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllSection().then(section => {
		DBs.selectPositionWithBalls().then(positions => {
			res.render('admin/kpi/page_add_kpi', {section: section, action: action, positions: positions});
		}).catch(err => {
			console.log(err);
			res.status(500).render('error/500');
		});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//GET-запрос страницы удаления ПЭДа
exports.deleteKpi = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllKpi().then(result => {
		res.render('admin/kpi/page_delete_kpi', {kpi: result, action: action});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//GET-запрос страницы изменения оценок одного ПЭД
exports.editBallsKpi = function(req, res) {
	let action = 0;
	let kpi = req.query.name;
	if(kpi) {
		DBs.selectOneKpiWithBalls(kpi).then(result => {
			let positions = [];
			let kpi = getKpiObj(result, positions);
			res.render('admin/kpi/page_edit_balls_kpi', {choose: true, arr: kpi.lines, positions: positions, 
				count_criterion: result[0].count_criterion, type: result[0].type, name: result[0].name, 
				description: result[0].description});
		}).catch(err => {
			console.log(err);
			res.status(500).render('error/500');
		});
	}
	else {
		if(req.query.action == 'ok') action = 1;
		if(req.query.action == 'err') action = 2;
		DBs.selectAllKpi().then(result => {
			res.render('admin/kpi/page_edit_balls_kpi', {kpi: result, choose: false, action: action});
		}).catch(err => {
			console.log(err);
			res.status(500).render('error/500');
		});
	}
};

//GET-запрос начальной страницы администратора
exports.main = function(req, res) {
	let date;
	if(req.body)
		date = new Date(req.body.date);
	else
		date = new Date();
	let strDate = dateModule.dateToString(date);
	let dateHTML = dateModule.dateForInput(date);
	let nameFile = strDate.split('.').join('_') + '.log';
	fs.readFile("./log/" + nameFile, "utf8", function(err, data) {
		let logs = [];
		if(err) {
			console.log("Сегодня не было действий");
			logs.push("Сегодня не было действий");
		}
		else {
			logs = data.split(';');
		}
		if(req.body) {
			res.render('admin/partials/list_logs', {logs: logs, date: dateHTML});
		}
		else {
			res.render('admin/main_page', {logs: logs, date: dateHTML});
		}
	});
};
/*
//GET-запрос страницы с получить логи конкретной даты
exports.getLogs = function(req, res) {
	let date = new Date(req.body.date);
	let strDate = dateModule.dateToString(date);
	let dateHTML = dateModule.dateForInput(date);
	let nameFile = strDate.split('.').join('_') + '.log';
	fs.readFile("./log/" + nameFile, "utf8", function(err, data) {
		let logs = [];
		if(err) {
			console.log("Сегодня не было действий");
			logs.push("Сегодня не было действий");
		}
		else {
			logs = data.split(';');
		}
		res.render('admin/partials/list_logs', {logs: logs, date: dateHTML});
	});
}
*/

//GET-запрос страницы со списком значений ПЭД пользователей
exports.getBallsUsers = function(req, res) {
	DBs.selectAllValueKpi().then(result => {
		for(let i = 0; i < result.length; i++) {
			result[i].date_str = dateModule.dateToString(result[i].date).split('_').join('.');
			result[i].start_date_str = dateModule.dateToString(result[i].start_date).split('_').join('.');
			result[i].finish_date_str = dateModule.dateToString(result[i].finish_date).split('_').join('.');
		}
		res.render('admin/page_values_kpi', {balls: result});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
}

//GET-запрос страницы установки текущего периода
exports.setPeriod = function(req, res) {
	res.render('admin/page_set_period', {set: objPeriod.set, period: objPeriod});
}

//GET-запрос страницы закрытия/открытия кабинетов
exports.closeAccount = function(req, res) {
	if(close) res.render('admin/page_close_account', {op: false});
	else res.render('admin/page_close_account', {op: true});
}

//POST-запрос на добавление пользователя
exports.POSTaddUser = function(req, res) {
	console.log("Добавление пользователя");
	console.log(req.body);
	let name = req.body.name;
	let position = req.body.position;
	let faculty = req.body.faculty;
	let department = req.body.department;
	let numDepartment = +req.body.numdepartment;
	let login = req.body.login;
	let password = req.body.password;
	if(!faculty) faculty = null;
	if(!numDepartment) department = null;

	bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(function(hashedPassword) {
		password = hashedPassword;
		//insertUser(name, position, faculty, department, login, password)
		DBi.insertUser(name, position, faculty, department, login, password).then(result => {
			//запись логов
			writeLogs(req.session.login, "добавил(а) нового пользователя: login - " + login);
			console.log("Сохранен объект user");
			res.redirect('/admin/users/add_user?action=ok');
		}).catch(err => {
			console.log("Скорее всего такой пользователь уже есть");
			res.redirect('/admin/users/add_user?action=err');
		});
	}).then(function() {
		console.log("Пароль успешно хеширован");
	}).catch(function(err) {
		console.log("Error saving user: ");
		console.log(err);
		res.status(500).render('error/500');
	});
};

//POST-запрос на добавление пользователей с файла
exports.POSTaddUsersFromFile = function(req, res) {
	let form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if(err) return console.log(err);

		let arr = ['xls', 'xlsx'];
		let ext = files.file.name.split('.').pop();
		if(!files.file || arr.indexOf(ext) == -1) 
			return res.redirect('/admin/users/add_users_from_file?action=err');

		let workBook = xlsx.readFile(files.file.path);
		let firstSheetName = workBook.SheetNames[0];
		let workSheet = workBook.Sheets[firstSheetName];

		let address = {"B" : "faculty", "C" : "department", "D" : "position", "E" : "login", 
			"F" : "password"};
		let num = 0;
		let arrUsers = [];
		let arrNames = [];
		let arrLogin = [];
		while(true) {
			let obj = {};
			let name = (workSheet["A" + (num + 1)] ? (workSheet["A" + (num + 1)].v + "") : undefined);
			if(!name) break;
			obj.name = name;
			for(let key in address) {
				let addr = key + (num + 1);
				obj[address[key]] = (workSheet[addr] ? (workSheet[addr].v + "") : undefined);
			}

			if(obj.position && obj.login && obj.password) {
				arrUsers.push(obj);
				arrNames.push(obj.name);
				arrLogin.push(obj.login);
			}
			num++;
		}
		//добавляем
		Promise.all(arrUsers.map(async function (user) {
			user.password = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
			let result = await DBi.insertUserFromObj(user);
			//записываем логи
			writeLogs(req.session.login, "добавил(а) нового пользователя: login - " + user.login);
			console.log("Сохранен объект user", user.login);
		})).then(result => {
			res.redirect('/admin/users/add_users_from_file?action=ok');
		});
	});
}

//POST-запрос на удаление пользователя
exports.POSTdeleteUser = function(req, res) {
	let login = req.body.user;
	DBd.deleteUser(login).then(result => {
		if(result.affectedRows > 0) {
			console.log("Удален пользователь: ", login);
			//записываем логи
			writeLogs(req.session.login, "удалил(а) пользователя " + login);
			res.redirect('/admin/users/delete_user?action=ok');
		}
		else {
			console.log("Нет такого пользователя: " + login);
			res.redirect('/admin/users/delete_user?action=err');
		}
	}).catch(err => {
		console.log(err);
		res.redirect('/admin/users/delete_user?action=err');
	});
};

//POST-запрос на закрытие личных кабинетов ППС
exports.POSTcloseAccounts = function(req, res) {
	//записываем логи
	writeLogs(req.session.login, "закрыл(а) личные кабинеты ППС");
	close = true;
	res.redirect('/admin/close_account');
}

//POST-запрос на открытие личных кабинетов ППС
exports.POSTopenAccounts = function(req, res) {
	//записываем логи
	writeLogs(req.session.login, "открыл(а) личные кабинеты ППС");
	close = false;
	res.redirect('/admin/close_account');
}

//POST-запрос на установку текущего периода
exports.POSTsetPeriod = function(req, res) {
	let date1 = req.body.date1;
	let date2 = req.body.date2;
	if(!date1 || !date2) {
		objPeriod.deletePeriod();
		objPeriod.notify = false;
	}
	else {
		objPeriod.setDate(date1, date2);
		//записываем логи
		writeLogs(req.session.login, "установил(а) период для отчета с " + 
			date1.split('-').reverse().join('.') + " по " + date2.split('-').reverse().join('.'));
	}
	res.redirect('/admin/set_period');
}

//POST-запрос на добавление одного ПЭД
exports.POSTaddKpi = function(req, res) {
	let indicatorSum, subtype = req.body.subtype;
	if(req.body.indicatorssumm == 'true') indicatorSum = 1;
	else indicatorSum = 0;
	if(req.body.subtype == '-') subtype = null;

	DBs.selectPositionWithBalls().then(positions => {
		//insertKpi (name, section, subtype, number, count_criterion, description, type, indicator_sum, action_time)
		DBi.insertKpi(req.body.name, req.body.section, subtype, +req.body.number, +req.body.count,
			req.body.desc, +req.body.type, indicatorSum, +req.body.implementationPeriod).then(result => {
				console.log("Добавлен ПЭД", req.body.name);

				//теперь добавляем критерри ПЭД в БД
				let criterions = [];

				let typeCriterion, n, a, b, nameCriterion, description, startVal, finalVal;
				if(+req.body.count == 1) {
					typeCriterion = req.body.typecrit;
					n = +req.body.n;
					a = +req.body.a;
					b = +req.body.b;
					nameCriterion = req.body.namecriterion;
					description = req.body.description;
					if(!nameCriterion) nameCriterion = req.body.typecrit;
				}

				//собираем массив объектов с информацией о критериях
				for(let i = 0; i < +req.body.count; i++) {

					let ballsArr = [];
					let criterion = {};

					if(+req.body.count != 1) {
						typeCriterion = req.body.typecrit[i];
						n = +req.body.n[i];
						a = +req.body.a[i];
						b = +req.body.b[i];
						nameCriterion = req.body.namecriterion[i];
						description = req.body.description[i];
						if(!nameCriterion) nameCriterion = req.body.typecrit[i];
					}
					if(req.body.type == '1')
						description = null;

					if(typeCriterion == 'Да/Нет') {
						startVal = 1;
						finalVal = null;
					}
					if(typeCriterion == 'Не менее n') {
						startVal = n;
						finalVal = null;
					}
					if(typeCriterion == 'От a до b') {
						startVal = a;
						finalVal = b;
					}

					criterion.name_kpi = req.body.name;
					criterion.name_criterion = nameCriterion;
					criterion.number_criterion = i;
					criterion.description = description;
					criterion.start_val = startVal;
					criterion.final_val = finalVal;

					for(let j = 0; j < positions.length; j ++) {
						let ball = +req.body[positions[j].position][i];
						if(+req.body.count == 1) ball = +req.body[positions[j].position];
						ballsArr.push([0, positions[j].position, ball]);
					}
					criterion.balls = ballsArr;
					criterions.push(criterion);
				}

				Promise.all(criterions.map(DBi.insertCriterion)).then(result => {
					console.log("Критерии ПЭД успешно добавлены");
					//записываем логи
					writeLogs(req.session.login, "добавил(а) ПЭД " + req.body.name);
					console.log("Сохранен объект kpi");
					res.redirect('/admin/kpi/add_kpi?action=ok');
				}).catch(err => {
					console.log("Скорее всего такой ПЭД уже есть");
					res.redirect('/admin/kpi/add_kpi?action=err');
				});
			}).catch(err => {
				console.log(err);
				res.redirect('/admin/kpi/add_kpi?action=err');
			});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//POST-запрос на удаление одного ПЭД
exports.POSTdeleteKpi = function(req, res) {
	DBd.deleteKpi(req.body.name).then(result => {
		if(result.affectedRows > 0) {
			console.log("Удален объект kpi ", req.body.name);
			//записываем логи
			writeLogs(req.session.login, "удалил(а) ПЭД " + req.body.name);
			res.redirect('/admin/kpi/delete_kpi?action=ok');
		}
		else {
			console.log("Такого ПЭД нет: " + req.body.name);
			res.redirect('/admin/kpi/delete_kpi?action=err');
		}
	}).catch(err => {
		console.log(err);
		res.redirect('/admin/kpi/delete_kpi?action=err');
	});
}

//POST-запрос на изменение оценок одного ПЭД
exports.POSTeditBallsKpi = function(req, res) {
	let idArr = req.body.id;
	let arrBalls = [];
	let countCrit = +req.body.countcrit;
	DBs.selectPositionWithBalls().then(positions => {
		for(let i = 0; i < countCrit; i++) {
			for(let j = 0; j < positions.length; j++) {
				let ball = +req.body[positions[j].position][i];
				let id = idArr[i];
				if(countCrit == 1) {
					ball = +req.body[positions[j].position];
					id = +idArr;
				}
				arrBalls.push([id, positions[j].position, ball]);
			}
		}
		Promise.all(arrBalls.map(DBu.updateBallOfCriterion)).then(result => {
			console.log("Оценки успешно изменены", req.body.name);
			//записываем логи
			writeLogs(req.session.login, "изменил(а) оценки ПЭД " + req.body.name);
			res.redirect('/admin/kpi/edit_balls?action=ok');
		}).catch(err => {
			console.log(err);
			res.redirect('/admin/kpi/edit_balls?action=err');
		});
	}).catch(err => {
		console.log(err);
		res.redirect('/admin/kpi/edit_balls?action=err');
	});
};

//POST-запрос для оповещения сотрудников о скором закрытии кабинетов
exports.notify = function(req, res) {
	objPeriod.notify = true;
	res.redirect('/admin/set_period');
}


//функции

//получение массива оценок объекта одного ПЭД
function getKpiObj(arr, positions) {
	if(!positions)
		positions = [];
	let kpi = {};
	for (key in arr[0]) {
		if(key != 'ball' && key !='position')
		kpi[key] = arr[0][key];
	}
	let lines = [];
	for(let i = 0; i < arr.length; i++) {
		let idCrit = arr[i].id;
		let criterion = arr[i].name_criterion;
		let desc = arr[i].criterion_description;
		let balls = [];
		while (i != arr.length && idCrit == arr[i].id) {
			if(positions.indexOf(arr[i].position) == -1)
				positions.push(arr[i].position);
			balls[positions.indexOf(arr[i].position)] = arr[i].ball;
			i++;
		}
		lines.push({name: criterion, description: desc, balls: balls, id: idCrit});
		i--;
	}
	kpi.lines = lines;
	return kpi;
}