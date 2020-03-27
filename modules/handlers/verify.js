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
		let myPage = false;
		if(level == 3) {
			myPage = true;
		}
		getFacultyForVerify(level, faculty, department).then(structure => {
			res.render('head/page_verify', {faculty: structure.faculty,
				department: structure.department, mypage: myPage, pageName: '/verify',
				login: req.session.login, level: req.session.level});
		});
	} catch (e) {
		console.log("Ошибка доступа");
		res.status(500).render('error/500');
	}
};

//Получение значения ПЭД
exports.getValPps = function(req, res) {
	let valId = req.params["valId"];
	console.log('valId', valId);
	let level = req.session.level;
	let department = req.session.department;
	let faculty = req.session.faculty;
	DBs.selectValueKpiByIdForVerify(valId).then(result => {
		//if(!result[0]) {
		//	res.render('pps/page_one_val', {val: result[0]});
		//}
		modifyDate(result);
		getFacultyForVerify(level, faculty, department).then(structure => {
			let val = null;
			if(level == 3 ||
                (level == 2 && structure.faculty.indexOf(result[0].faculty) !== -1) ||
                (level == 1 && structure.department.indexOf(result[0].department) !== -1)) {
			//if(result[0] && structure.faculty.indexOf(result[0].faculty) !== -1 &&
			//	structure.department.indexOf(result[0].department) !== -1) {
				val = result[0];
			}
			console.log('val', val);
			res.render('head/page_val_kpi', {val: val, pageName: '/my-page/val/',
				level: req.session.level, login: req.session.login});
		});
	}).catch(err => {
		console.log(err);
	});
};

//POST-запрос на получение таблицы для проверки значений ПЭД ППС
exports.POSTverify = function(req, res) {
	let login = req.body.name;
	console.log(login);
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
};

//POST-запрос на пометку значения ПЭД как недействительное
exports.POSTinvalid = function(req, res) {
	let invalidId = req.body.id;
	let invalidComment = req.body.comment;
	let login = req.session.login;
	DBu.updateValueInvalid(invalidId, login, invalidComment).then(result => {
	    console.log(result);
	    //записываем логи
        writeLogs(login, req.session.level, "сделал(а) отметку о недействительности значения ПЭД с id" +
            invalidId + " по следующей причине: " + invalidComment);
        res.json({"result": 'ok', "login": login});
	}).catch(err => {
	    console.log(err);
        res.json({'result': 'err'});
	});
};

//POST-запрос на отмену пометки недействительности значения ПЭД
exports.POSTcancelInvalid = function(req, res) {
    let invalidId = req.body.id;
    let login = req.session.login;
    DBu.updateValueCancelInvalid(invalidId).then(result => {
        //записываем логи
        writeLogs(login, req.session.level, "сделал(а) значения ПЭД с id" +
            invalidId + " действительной (отмена отметки)");
        res.json({"result": 'ok', "login": login});
    }).catch(err => {
        console.log(err);
        res.json({'result': 'err'});
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

};

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
};


//преобразование даты к нормальному виду
function modifyDate(arrObj) {
	for(let i = 0; i < arrObj.length; i++) {
		modifyOneDate(arrObj[i], 'date');
		if(arrObj[i]['start_date'])
			modifyOneDate(arrObj[i], 'start_date');
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

async function getFacultyForVerify(level, faculty, department) {
	let facultyArr = [];
	let departmentArr = [];
	switch(level) {
		//проректор
		case 3:
			let structure = await DBs.selectStructure();
			facultyArr = additFunc.getFaculty(structure);
			departmentArr = additFunc.getDepartment(facultyArr[0], structure);
			break;
		//декан
		case 2:
			let result = await DBs.selectDepartments(faculty);
			facultyArr.push(faculty);
			for(let i = 0; i < result.length; i++) {
				departmentArr.push(result[i].department);
			}
			break;
		//зав. кафедрой
		case 1:
			facultyArr.push(faculty);
			departmentArr.push(department);
			break;
		//другие
		default:
			throw new Error("Server Error: no permissions");
			break;
	}
	return {faculty: facultyArr, department: departmentArr};
}