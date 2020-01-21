let writeLogs = require('../logs').log;
let additFunc = require('../additional');

let DBs = require('../db/select.js');
let DBu = require('../db/update.js');

//GET-запрос страницы проверки ПЭДов
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
					res.render('head/page_verify', {faculty: facultyArr, department: departmentArr, mypage: true});
				}).catch(err => {
					console.log(err);
					res.status(500).render('error/500');
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
					res.render('head/page_verify', {faculty: facultyArr, department: departmentArr, mypage: false});
				}).catch(err => {
					console.log(err);
					res.status(500).render('error/500');
				});
				break;
			//зав. кафедрой
			case 1:
				let facultyArr = [];
				let departmentArr = [];
				facultyArr.push(faculty);
				departmentArr.push(department);
				res.render('head/page_verify', {faculty: facultyArr, department: departmentArr, mypage: false});
				break;
			//другие
			default:
				throw new Error("Server Error: no permissions");
				break;
		}
	} catch (e) {
		console.log("Ошибка доступа");
		res.status(500).render('error/500');
	}
};


//POST-запрос на получение таблицы для проверки значений ПЭД ППС
exports.POSTverify = function(req, res) {
	let login = req.body.name;
	//находим значения ПЭД выбранного сотрудника
	DBs.selectValueKpiByLogin(login).then(result => {
		if(result.length == 0) {
			res.render("head/partials/table_for_verify", {kpi: [], textErr: "Нет добавленных действительных значений"});
		}
		else {
			modifyDate(result);
			res.render("head/partials/table_for_verify", {kpi: result, textErr: false});
		}
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
}

//POST-запрос на пометку значения ПЭД как недействительное
exports.POSTinvalid = function(req, res) {
	let invalidKpi = req.body.kpi;
	let chooseUser = req.body.user;
	let name = req.session.login;
	console.log(invalidKpi);
	new Promise(function(resolve, reject) {
		for(let i = 0; i < invalidKpi.length; i++) {
			DBu.updateValueInvalid(invalidKpi[i].id, name, invalidKpi[i].comment).then(result => {
				console.log(result);
				//записываем логи
				writeLogs(name, req.session.level, "сделал(а) отметку о недействительности ПЭД " + invalidKpi[i].name +
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
exports.POSTgetWorkers = function(req, res) {
	let level = req.session.level;
	let faculty = req.body.faculty;
	let department = req.body.department;
	DBs.selectUserFromDepartment(faculty, department, level).then(result => {
		res.render('head/partials/list_workers_division', {worker: result});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});

}

//получить структуру
exports.POSTgetStructure = function(req, res) {
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
		res.status(500).render('error/500');
	});
}


//преобразование даты к нормальному виду
function modifyDate(arrObj) {
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