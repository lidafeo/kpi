const fs = require("fs");

let writeLogs = require('../logs');
let additFunc = require('../additional');

let DBs = require('../db/select.js');
let DBu = require('../db/update.js');

//страница проверки ПЭДов
exports.verify = function(req, res) {
	let level = req.session.level;
	let department = req.session.department;
	let faculty = req.session.faculty;
	try {
		switch(level) {
			//проректор
			case 3:
				DBs.selectStructure().then(result => {
					let structure = result;
					let facultyArr = additFunc.getFaculty(structure);
					let departmentArr = additFunc.getDepartment(facultyArr[0], structure);
					res.render('verify', {faculty: facultyArr, department: departmentArr, mypage: true});
				}).catch(err => {
					console.log(err);
				});
				break;
			//декан
			case 2:
				DBs.selectDepartments(faculty).then(result => {
					let facultyArr = [];
					facultyArr.push(faculty);
					let departmentArr = [];
					for(let i = 0; i < result.length; i++) {
						departmentArr.push(result[i].department);
					}
					res.render('verify', {faculty: facultyArr, department: departmentArr, mypage: false});
				}).catch(err => {
					console.log(err);
				});
				break;
			//зав. кафедрой
			case 1:
				let facultyArr = [];
				let departmentArr = [];
				facultyArr.push(faculty);
				departmentArr.push(department);
				res.render('verify', {faculty: facultyArr, department: departmentArr, mypage: false});
				break;
			//другие
			default:
				throw new Error("Server Error: no permissions");
				break;
		}
	} catch (e) {
		return console.log("Ошибка доступа");
	}
};


//получение таблицы для проверки
exports.POSTverify = function(req, res) {
	let faculty = req.body.faculty;
	let department = req.body.department;
	let name = req.body.name;
	let position = req.body.position;
	//находим значения ПЭД выбранного сотрудника
	DBs.selectValueKpiByNameAndPosition(name, position, faculty, department).then(result => {
		if(result.length == 0) {
			res.render("partials/verifyVal", {kpi: [], textErr: "Нет добавленных действительных значений"});
		}
		else {
			modifydate(result);
			res.render("partials/verifyVal", {kpi: result, textErr: false});
		}
	}).catch(err => {
		console.log(err);
	});
}

//помечаем ПЭДы как недействительные
exports.POSTinvalid = function(req, res) {
	let invalidKpi = req.body.kpi;
	let chooseUser = req.body.user;
	let name = req.session.userName;
	console.log(invalidKpi);
	new Promise(function(resolve, reject) {
		for(let i = 0; i < invalidKpi.length; i++) {
			DBu.updateValueInvalid(invalidKpi[i].id, name, invalidKpi[i].comment).then(result => {
				console.log(result);
				//записываем логи
				let text = invalidKpi[i].comment.split(';').join('.');
				writeLogs(name, "сделал(а) отметку о недействительности ПЭД " + invalidKpi[i].name + 
					" пользователя " + chooseUser + " по следующей причине: " + invalidKpi[i].comment);
				resolve('ok');
			}).catch(err => {
				console.log(err);
				reject('err');
			});
		}
	}).then(result => {
		res.send(result);
	}).catch(error => {
		res.send(error);
	});
};

//получить сотрудников кафедры
exports.POSTgetworkers = function(req, res) {
	let level = req.session.level;
	let faculty = req.body.faculty;
	let department = req.body.department;
	DBs.selectUserFromDepartment(faculty, department, level).then(result => {
		res.render('partials/workersdep', {worker: result});
	}).catch(err => {
		console.log(err);
	});

}

//получить структуру
exports.POSTgetstructure = function(req, res) {
	DBs.selectStructure().then(result => {
		let structure = {faculty: [], department: []};
		for(let i = 0; i < result.length; i ++) {
			if(structure.faculty.indexOf(result[i].faculty) == -1) {
				structure.faculty.push(result[i].faculty);
				structure.department[structure.faculty.indexOf(result[i].faculty)] = [];
			}
			structure.department[structure.faculty.indexOf(result[i].faculty)].push(result[i].department);
		}
		res.json(structure);
	}).catch(err => {
		console.log(err);
	});
}


//преобразование даты к нормальному виду
function modifydate(arrObj) {
	for(let i = 0; i < arrObj.length; i++) {
		modifyOneDate(arrObj[i], 'date');
	}
}

function modifyOneDate (obj, prop) {
	let date = obj[prop];
	let objDate = date.getDate();
	let objMonth = date.getMonth() + 1;
	let objYear = date.getFullYear();
	if(objDate < 10) objDate = "0" + objDate;
	if(objMonth < 10) objMonth = "0" + objMonth;
	obj['modify' + prop] = objDate + '.' + objMonth + '.' + objYear;
}