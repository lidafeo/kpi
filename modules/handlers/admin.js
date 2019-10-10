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

exports.getclose = function() {
	return close;
}

//текущий период отчета
let objPeriod = {
	setbool: false,
	notify: false,
	deletePeriod: function() {
		this.setbool = false;
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
		this.setbool = true;
	}
};

exports.getObjPeriod = function() {
	return objPeriod;
}

//проверка прав админа
exports.checkadmin = function(req, res, next) {
	if(req.session.level != 10) return res.redirect('/404');
	else next();
}

//получение списка работников
exports.getusers = function(req, res) {
	DBs.selectAllUsers().then(users => {
		res.render('admin/listusers', {users: users});
	}).catch(err => {
		console.log(err);
	});
	
}

//добавление сотрудника
exports.adduser = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllPosition().then(pos => {
		DBs.selectStructure().then(result => {

			let structure = result;
			let facultyArr = additFunc.getFaculty(structure);
			res.cookie("faculty", JSON.stringify(facultyArr));
			let departmentArr = [];
			for(let i = 0; i < facultyArr.length; i++)
				departmentArr.push(additFunc.getDepartment(facultyArr[i], structure));
			
			res.render('admin/adduser', {positions: pos, action: action, faculty: facultyArr, 
				department: departmentArr});
		}).catch(err => {
			console.log(err);
		});
	}).catch(err => {
		console.log(err);
	});
};

//добавление сотрудников с файла
exports.adduserfile = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	res.render('admin/adduserfile', {action: action});
};

//удаление сотрудника
exports.deleteuser = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllUsers().then(users => {
		res.render('admin/deleteuser', {users: users, action: action});
	}).catch(err => {
		console.log(err);
	});
};

//получение списка ПЭДов
exports.getkpi = function(req, res) {
	DBs.selectAllKpiWithCriterion().then(result => {
		let section = [];
		let kpi = [];
		for(let i = 0; i < result.length; i++) {
			let balls = [];
			for(let j = 0; j < 6; j++)
				balls.push(result[i][('ball_' + j)]);
			result[i].balls = balls;
			if(section.indexOf(result[i].section) == -1){
				section.push(result[i].section);
				kpi.push([]);
			}
			kpi[section.indexOf(result[i].section)].push(result[i]);
		}
		res.render('admin/listkpi', {kpi: kpi});
	}).catch(err => {
		console.log(err);
	});
}

//добавление ПЭДа
exports.addkpi = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllSection().then(section => {
		res.render('admin/addkpi', {section: section, action: action});
	}).catch(err => {
		console.log(err);
	});
};

//страница удаления ПЭДа
exports.deletekpi = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllKpi().then(result => {
		res.render('admin/deletekpi', {kpi: result, action: action});
	}).catch(err => {
		console.log(err);
	});
};

//страница изменения оценок ПЭДа
exports.editballs = function(req, res) {
	let action = 0;
	if(req.query.action == 'ok') action = 1;
	if(req.query.action == 'err') action = 2;
	DBs.selectAllKpi().then(result => {
		res.render('admin/editballs', {kpi: result, choose: false, action: action});
	}).catch(err => {
		console.log(err);
	})
};

//страница администратора
exports.main = function(req, res) {
	let date = new Date();
	let strDate = dateModule.dateToString(date);
	let dateHTML = dateModule.dateForInput(date);
	let namefile = strDate.split('.').join('_') + '.log';
	fs.readFile("./log/" + namefile, "utf8", function(err, data) {
		let logs = [];
		if(err) {
			console.log(err);
			logs.push("Сегодня не было действий");
		}
		else {
			logs = data.split(';');
		}
		res.render('admin/admin', {logs: logs, date: dateHTML});
	});
};

//получить логи конкретной даты
exports.getlogs = function(req, res) {
	let date = new Date(req.body.date);
	let strDate = dateModule.dateToString(date);
	let dateHTML = dateModule.dateForInput(date);
	let namefile = strDate.split('.').join('_') + '.log';
	fs.readFile("./log/" + namefile, "utf8", function(err, data) {
		let logs = [];
		if(err) {
			console.log(err);
			logs.push("Сегодня не было действий");
		}
		else {
			logs = data.split(';');
		}
		res.render('admin/partials/getlogs', {logs: logs, date: dateHTML});
	});
}


//получение значений ПЭД пользователей
exports.getballusers = function(req, res) {
	DBs.selectAllValueKpi().then(result => {
		for(let i = 0; i < result.length; i++) {
			result[i].datestr = dateModule.dateToString(result[i].date).split('_').join('.');
			result[i].start_datestr = dateModule.dateToString(result[i].start_date).split('_').join('.');
			result[i].finish_datestr = dateModule.dateToString(result[i].finish_date).split('_').join('.');
		}
		res.render('admin/tableuservalue', {balls: result});
	}).catch(err => {
		console.log(err);
	});
}

//страница установки текущего периода
exports.setperiod = function(req, res) {
	res.render('admin/setperiod', {setbool: objPeriod.setbool, period: objPeriod});
}

//страница закрытия/открытия кабинетов
exports.closeaccount = function(req, res) {
	if(close) res.render('admin/closeaccount', {op: false});
	else res.render('admin/closeaccount', {op: true});
}

//добавление пользователя
exports.POSTadduser = function(req, res) {
	console.log("Добавление пользователя");
	console.log(req.body);
	let name = req.body.name;
	let position = req.body.position;
	let faculty = req.body.faculty;
	let department = req.body.department;
	let numdepartment = +req.body.numdepartment;
	let login = req.body.login;
	let password = req.body.password;
	if(!faculty) faculty = null;
	if(!numdepartment) department = null;

	bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(function(hashedPassword) {
		password = hashedPassword;
		//insertUser(name, position, faculty, department, login, password)
		DBi.insertUser(name, position, faculty, department, login, password).then(result => {
			//запись логов
			writeLogs(req.session.userName, "добавил(а) нового пользователя: должность - " + 
				position + ", ФИО - " + name);
			console.log("Сохранен объект user");
			res.redirect('/admin/adduser?action=ok');
		}).catch(err => {
			console.log("Скорее всего такой пользователь уже есть");
			res.redirect('/admin/adduser?action=err');
		});
	}).then(function() {
		console.log("Пароль успешно хеширован");
	}).catch(function(error) {
		console.log("Error saving user: ");
		console.log(error);
	});
};

//добавление пользователей с файла
exports.POSTadduserfile = function(req, res) {
	let form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if(err) return console.log(err);

		let arr = ['xls', 'xlsx'];
		let ext = files.file.name.split('.').pop();
		if(!files.file || arr.indexOf(ext) == -1) 
			return res.redirect('/admin/adduserfile?action=err');

		let workbook = xlsx.readFile(files.file.path);
		let first_sheet_name = workbook.SheetNames[0];
		let worksheet = workbook.Sheets[first_sheet_name];

		let address = {"B" : "faculty", "C" : "department", "D" : "position", "E" : "login", 
			"F" : "password"};
		let num = 0;
		let arrUsers = [];
		let arrNames = [];
		let arrLogin = [];
		while(true) {
			let obj = {};
			let name = (worksheet["A" + (num + 1)] ? (worksheet["A" + (num + 1)].v + "") : undefined);
			if(!name) break;
			obj.name = name;
			for(let key in address) {
				let addr = key + (num + 1);
				obj[address[key]] = (worksheet[addr] ? (worksheet[addr].v + "") : undefined);
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
			let result = DBi.insertUserFromObj(user);
			//записываем логи
			writeLogs(req.session.userName, "добавил(а) нового пользователя: должность - " + 
				user.position + ", ФИО - " + user.name);
			console.log("Сохранен объект user", user.login);
		})).then(result => {
			res.redirect('/admin/adduserfile?action=ok');
		});
	});
}

//удаление пользователя
exports.POSTdeleteuser = function(req, res) {
	let login = req.body.user;
	DBd.deleteUser(login).then(result => {
		console.log("Удален пользователь: ", login);
		//записываем логи
		writeLogs(req.session.userName, "удалил(а) пользователя " + login);
		res.redirect('/admin/deleteuser?action=ok');
	}).catch(err => {
		console.log(err);
		res.redirect('/admin/deleteuser?action=err');
	});
};

//закрыть кабинеты
exports.POSTcloseaccount = function(req, res) {
	let date = new Date();
	//записываем логи
	writeLogs(req.session.userName, "закрыл(а) личные кабинеты ППС");
	close = true;
	res.redirect('admin/closeaccount');
}
//открыть кабинеты
exports.POSTopenaccount = function(req, res) {
	let date = new Date();
	//записываем логи
	writeLogs(req.session.userName, "открыл(а) личные кабинеты ППС");
	close = false;
	res.redirect('admin/closeaccount');
}

//установка текущего периода
exports.POSTsetperiod = function(req, res) {
	let date1 = req.body.date1;
	let date2 = req.body.date2;
	if(!date1 || !date2) {
		objPeriod.deletePeriod();
		objPeriod.notify = false;
	}
	else {
		objPeriod.setDate(date1, date2);
		//записываем логи
		writeLogs(req.session.userName, "установил(а) период для отчета с " + 
			date1.split('-').reverse().join('.') + " по " + date2.split('-').reverse().join('.'));
	}
	res.redirect('/admin/setperiod');
}

//добавление ПЭДа
exports.POSTaddkpi = function(req, res) {
	let indicator_sum, subtype = req.body.subtype;
	if(req.body.indicatorssumm == 'true') indicator_sum = 1;
	else indicator_sum = 0;
	if(req.body.subtype == '-')  subtype = null;

	//insertKpi (name, section, subtype, number, count_criterion, description, type, indicator_sum, action_time)
	DBi.insertKpi(req.body.name, req.body.section, subtype, +req.body.number, +req.body.count,
		req.body.desc, +req.body.type, indicator_sum, +req.body.implementationPeriod).then(result => {
			console.log("Добавлен ПЭД");

			//теперь добавляем критерри ПЭД в БД
			let criterions = [];

			let typecrit, n, a, b, namecriterion, description, start_val, final_val;
			if(+req.body.count == 1) {
				typecrit = req.body.typecrit;
				n = +req.body.n;
				a = +req.body.a;
				b = +req.body.b;
				namecriterion = req.body.namecriterion;
				description = req.body.description;
				if(!namecriterion) namecriterion = req.body.typecrit;
			}

			//собираем массив объектов с информацией о критериях
			for(let i = 0; i < +req.body.count; i++) {

				let criterion = {};

				if(+req.body.count != 1) {
					typecrit = req.body.typecrit[i];
					n = +req.body.n[i];
					a = +req.body.a[i];
					b = +req.body.b[i];
					namecriterion = req.body.namecriterion[i];
					description = req.body.description[i];
					if(!namecriterion) namecriterion = req.body.typecrit[i];
				}
				if(req.body.type == '1')
					description = null;

				if(typecrit == 'Да/Нет') {
					start_val = 1;
					final_val = null;
				}
				if(typecrit == 'Не менее n') {
					start_val = n;
					final_val = null;
				}
				if(typecrit == 'От a до b') {
					start_val = a;
					final_val = b;
				}

				criterion.name_kpi = req.body.name;
				criterion.name_criterion = namecriterion;
				criterion.number_criterion = i;
				criterion.description = description;
				criterion.start_val = start_val;
				criterion.final_val = final_val;

				let balls = [];
				for(let j = 1; j < 7; j ++) {
					let gn = 'g' + j;
					let ball = +req.body[gn][i];
					if(+req.body.count == 1) ball = +req.body[gn];
					balls.push(ball);
				}
				criterion.balls = balls;
				criterions.push(criterion);
			}

			Promise.all(criterions.map(DBi.insertCriterion)).then(result => {
				console.log("Критерии ПЭД успешно добавлены");
				//записываем логи
				writeLogs(req.session.userName, "добавил(а) ПЭД " + req.body.name);
				console.log("Сохранен объект kpi");
				res.redirect('/admin/addkpi?action=ok');
			}).catch(err => {
				console.log("Скорее всего такой ПЭД уже есть");
				res.redirect('/admin/addkpi?action=err');
			});
		}).catch(err => {
			console.log(err);
			res.redirect('/admin/addkpi?action=err');
		});
};

//Удаление ПЭДа
exports.POSTdeletekpi = function(req, res) {
	DBd.deleteKpi(req.body.name).then(result => {
		console.log("Удален объект kpi ", req.body.name);
		//записываем логи
		writeLogs(req.session.userName, "удалил(а) ПЭД " + req.body.name);
		res.redirect('admin/deletekpi?action=ok');
	}).catch(err => {
		console.log(err);
		res.redirect('admin/deletekpi?action=err');
	});
}

//Изменение оценок ПЭДа
exports.POSTeditballskpi = function(req, res) {
	let balls = req.body.balls;
	let arrballs = [];
	let number_criterion = 0;
	for(let i = 0; i < balls.length; i = i + 6) {
		arrBall = [];
		for(let j = i; j < i + 6; j++) {
			arrBall.push(balls[j]);
			if(!+balls[j]) return res.redirect('admin/editballs?action=err');
		}
		arrballs.push({name_kpi: req.body.name, number_criterion: number_criterion, balls: arrBall});
		number_criterion ++;
	}
	Promise.all(arrballs.map(DBu.updateBallOfCriterion)).then(result => {
		console.log("Оценки успешно изменены", req.body.name);
		//записываем логи
		writeLogs(req.session.userName, "изменил(а) оценки ПЭД " + req.body.name);
		res.redirect('admin/editballs?action=ok');
	}).catch(err => {
		console.log(err);
		res.redirect('admin/editballs?action=err');
	});
};

//Выбор ПЭДа на изменение его оценок
exports.POSTeditballs = function(req, res) {
	DBs.selectOneKpi(req.body.name).then(result => {
		for(let i = 0; i < result.length; i++) {
			let balls = [];
			for(let j = 0; j < 6; j++) {
				balls.push(result[i][("ball_" + j)]);
			}
			result[i].balls = balls;
		}
		res.render('admin/editballs', {choose: true, arr: result, 
				type: result[0].type, name: result[0].name, description: result[0].description});
	}).catch(err => {
		console.log(err);
		res.redirect('500');
	});
};

//Оповещение сотрудников о скором закрытии кабинетов
exports.notify = function(req, res) {
	objPeriod.notify = true;
	res.redirect('/admin/setperiod');
}

/*
//Получение факультетов
exports.POSTgetfaculty = function(req, res) {
	Structure.find({}, function(err, doc) {
		let faculty = [];
		for(let i = 0; i < doc.length; i++)
			faculty.push(doc[i].faculty);
		res.send(faculty.join('_,'));
	});
};
*/

/*
//сортировка названий ПЭДов
function sortArr(a, b) {
	if(a.section > b.section) return 1;
	if(a.section < b.section) return -1;
	if(a.subtype > b.subtype) return 1;
	if(a.subtype < b.subtype) return -1;
	return (a.number - b.number);
}
*/