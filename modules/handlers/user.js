const formidable = require("formidable");
const fs = require("fs");

let DBs = require('../db/select.js');
let DBi = require('../db/insert.js');

let dateModule = require('../date.js');
let writeLogs = require('../logs');

let getObjPeriod = require('./admin.js').getObjPeriod;

//главная страница пользователя
exports.myPage = function(req, res) {
	let name = req.session.userName;
	let login = req.session.login;
	let position = req.session.userPosition;
	let level = req.session.level;
	//let numberGroup = req.session.numberGroup;
	//if(numberGroup == null) {
	//	console.log("У пользователя нет ПЭД");  
		if(level == 3) return res.redirect('/verify');
		if(level == 10) return res.redirect('/admin');
		if(level == 11) return res.redirect('/pfu');
	//}

	let date1 = req.query.date1;
	let date2 = req.query.date2;

	//Если период отчета не задан, устанавливаем
	if(!date1 || !date2) {
		let dt1 = new Date();
		let dt2 = new Date();
		dt1.setMonth(dt1.getMonth() - 6);
		date1 = dateModule.dateForInput(dt1);
		date2 = dateModule.dateForInput(dt2);
	}
	let d1 = new Date(date1);
	let d2 = new Date(date2);
	//ищем опубликованные значения ПЭДов в заданный период
	DBs.selectValueKpiUserInPeriod(login, dateModule.dateForInput(d1), dateModule.dateForInput(d2))
	.then(result => {
		let objPeriod = getObjPeriod();
		if(result.length == 0) {
			res.render("pps/main_page", {name: name, position: position, kpi: null, date1: 
				date1, date2: date2, level: level, objPeriod: objPeriod});
		}
		else {
			new Promise((resolve, reject) => {
				DBs.selectAllCriterion(position).then(result => {
					let arrObj = [];
					let kpi = [];
					for(let i = 0; i < result.length; i++) {
						if(kpi.indexOf(result[i].name_kpi) == -1) {
							arrObj.push({nameKpi: result[i].name_kpi, criterion: []});
							kpi.push(result[i].name_kpi);
						}
						arrObj[kpi.indexOf(result[i].name_kpi)].criterion.push({nameCriterion: result[i].name_criterion,
							startVal: result[i].start_val, finalVal: result[i].final_val, 
							ball: result[i].ball, description: result[i].criterion_description});
					}
					resolve(arrObj);
				}).catch(err => {
					console.log(err);
					res.status(500).render('error/500');
				});
			}).then(arrCriterion => {
				let kpi = createArrayOfKeyValues(arrCriterion, 'nameKpi');
				//Формирование массива названий ПЭДов
				let userValues = result;
				let arrKpi = [];

				let info = {};
				let nameKpi = userValues[0].name_kpi;
				let section = [];
				//добавление к свойствам ПЭДов оценок пользователя
				for(let i = 0; i <= userValues.length; i ++) {
					if(i == userValues.length || nameKpi != userValues[i].name_kpi) {
						//сортировка по разделам деятельности
						if(section.indexOf(userValues[i - 1].section) == -1) {
							section.push(userValues[i - 1].section);
							arrKpi.push([]);
						}
						arrKpi[section.indexOf(userValues[i - 1].section)].push(info);

						info = {};
					}
					if(i != userValues.length) {
						nameKpi = userValues[i].name_kpi;
						//добавление информации к ПЭДам
						sortKpi(userValues[i], info, arrCriterion[kpi.indexOf(nameKpi)].criterion);
						info.userBall = calculateBall(info, arrCriterion[kpi.indexOf(nameKpi)].criterion);
					}
				}
				//устанавливаем правильный порядок вывода ПЭДов
				for(let i = 0; i < arrKpi.length; i++)
					arrKpi[i].sort(sortArr);
				res.render("pps/main_page", {name: name, position: position, kpi: arrKpi,
					date1: date1, date2: date2, level: level, objPeriod: objPeriod});
			});
		}
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//GET-запрос страницы добавления значений ПЭД
exports.editKpi = function(req, res) {
	DBs.selectAllKpi().then(result => {
		let obj = {};
		for(let i = 0; i < result.length; i++) {
			if(!obj[result[i].section])
				obj[result[i].section] = {};
			if(result[i].subtype) {
				if(!obj[result[i].section][result[i].subtype])
					obj[result[i].section][result[i].subtype] = [];
				obj[result[i].section][result[i].subtype].push({name: result[i].name,
				description: result[i].description});
			}
			else {
				if(!obj[result[i].section]['nosubtype'])
					obj[result[i].section]['nosubtype'] = [];
				obj[result[i].section]['nosubtype'].push({name: result[i].name,
				description: result[i].description});
			}
		}
		for(sect in obj) {
			for(subt in obj[sect]) {
				obj[sect][subt].sort(function(a, b) {
					return (+a['name'].match(/\d/g).join('') > +b['name'].match(/\d/g).join('')) ? 1 : -1;
				});
			}
		}
		res.render('pps/page_add_value_kpi', {obj: obj, level: req.session.level});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//GET-запрос страницы просмотра добавленных значений ПЭД
exports.valueKpi = function(req, res) {
	DBs.selectValueKpiUser(req.session.login).then(result => {
		modifyDate(result);
		res.render('pps/page_values_kpi', {kpi: result, level: req.session.level});
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
}

//отправка файла пользователю
exports.sendFile = function(req, res) {
	let file = req.query.file;
	DBs.selectValueKpiById(file).then(result => {
		doc = result[0];
		res.download("./user_files/" + file + '.' + doc.file.split('.').pop(), doc.file);
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//POST-запрос прошлых подтверждений ПЭД
exports.POSTeditKpi = function(req, res) {
	let position = req.session.userPosition;
	let login = req.session.login;
	DBs.selectBallOneKpi(req.body.name, position).then(kpi => {
		if(kpi[0].ball != 0) {
			DBs.selectValueKpiUserOneKpi(login, req.body.name).then(result => {
				modifyDate(result);
				res.render("pps/partials/table_posted_values", {kpi: result, desc: kpi, textErr: false});
			}).catch(err => {
				console.log(err);
				res.status(500).render('error/500');
			});
		}
		else {
			res.render("pps/partials/table_posted_values", {kpi: [], textErr: true});
		}
	}).catch(err => {
		console.log(err);
		res.status(500).render('error/500');
	});
};

//POST-запорс на добавление значения одного ПЭД
exports.POSTupload = function(req, res) {
	let login = req.session.login;
	let form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if(err) return console.log(err);

		let fileName = "";
		if(!files.file && fields.text == "" || +fields.value == 0 || fields.date == "") 
			return res.send('err');

		let radio = 0;
		if(fields.radio) radio = fields.radio;
		//находим в БД добавляемый ПЭД, чтобы узнать время его действия
		DBs.selectOneKpi(fields.name).then(result => {
			let kpi = result[0];
			let finishDate = new Date(fields.date);
			if(files.file) fileName = files.file.name;
			finishDate.setMonth(finishDate.getMonth() + kpi.action_time);

				DBi.insertValueKpi(login, kpi.name, +fields.value, dateModule.dateForInput(new Date()), 
					dateModule.dateForInput(new Date(fields.date)), dateModule.dateForInput(finishDate), 
					fields.text, fileName, radio).then(result => {
						console.log("Сохранен объект uservalue");
						res.send('ok');
						//записываем логи
						writeLogs(login, req.session.level, "добавил(а) новое значение ПЭД " + kpi.name + " равное " + fields.value);
						let id = result.insertId;
						//сохраняем прикрепленный файл
						if(files.file) {
							fileName = files.file.name;
							let ext = fileName.split('.').pop();
							let readableStream = fs.createReadStream(files.file.path);
							let writeableStream = fs.createWriteStream("./user_files/" +
								id + '.' + ext);
							readableStream.pipe(writeableStream);
						}
				}).catch(err => {
					console.log(err);
					res.status(500).render('error/500');
				});
		});
	});
};


//сортировка и 
//добавление доп информации по ПЭДам: количество подтвержденных, балл, дата подтверждения
function sortKpi(userValue, info, criterion) {

	//копирование свойств
	info.description = userValue.description;
	info.name = userValue.name;
	info.type = userValue.type;
	info.indicatorSum = userValue.indicator_sum;
	info.section = userValue.section;
	info.subtype = userValue.subtype;
	info.number = userValue.number;
	info.countCriterion = userValue.count_criterion;
	info.criterion = criterion;

	if(userValue.type == 1) {
		if(info.count) info.count++;
		else {
			info.count = 1;
			info.val = [];
			info.date = [];
		}
	}
	else {
		if(!info.count) {
			info.count = [];
			info.val = [];
			info.date = [];
			info.num = [];
			for(let k = 0; k < userValue.count_criterion; k++)
				info.count[k] = 0;
		}
		info.count[userValue.number_criterion] ++;
	}
	info.val.push(userValue.value);
	info.date.push(userValue.date);
	if (userValue.type == 2) {
		info.num.push(userValue.number_criterion);
	}
}

//преобразование даты к нормальному виду
function modifyDate(arrObj) {
	for(let i = 0; i < arrObj.length; i++) {
		modifyOneDate(arrObj[i], 'date');
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

//вычисление оценки
function calculateBall(kpi, criterion) {
	let value;
	let ball = [];
	//ставим оценку ПЭДу первого типа
	if(kpi.type == 1) {
		//находим балл
		value = getBall (kpi);
		//вычисляем оценку
		for(let i = 0; i < criterion.length; i++) {
			if(!criterion[i].finalVal) criterion[i].finalVal = Infinity;
			if(value >= criterion[i].startVal && value <= criterion[i].finalVal) {
				ball[0] = criterion[i].ball;
			}
			else if(!ball[0]) ball[0] = 0;
		}
	}
	//ставим оценку ПЭДу второго типа
	else {
		//находим и вычисляем оценку для каждой подстроки
		for(let i = 0; i < criterion.length; i++) {
			value = getBall(kpi, i);
			if(!criterion[i].finalVal) criterion[i].finalVal = Infinity;
			if(value >= criterion[i].startVal && value <= criterion[i].finalVal) {
				if(kpi.num.indexOf(i) != -1) {
					ball.push(criterion[i].ball);
				}
				else ball.push(0);
			}
			else ball.push(0);
		}
	}
	return ball;
}

//функция вычисления балла
function getBall (kpi, k) {
	let value = 0;
	if(kpi.indicatorSum) {
		if(kpi.type == 1) value = kpi.count;
		else value = kpi.count[k];
	}
	else {
		let date = new Date(0);	
		for(let i = 0; i < kpi.count; i++) {
			if(kpi.type == 1 || kpi.type == 2 && kpi.num[i] == k)
				if(kpi.date[i] > date) {
					value = kpi.val[i];
					date = kpi.date[i];
				}
		}
	}
	return value;
}

//сортировка названий ПЭДов
function sortArr(a, b) {
	if(a.section > b.section) return 1;
	if(a.section < b.section) return -1;
	if(a.subtype > b.subtype) return 1;
	if(a.subtype < b.subtype) return -1;
	return (a.number - b.number);
}

//Формирование массива значений из массива объектов одного ключа
function createArrayOfKeyValues(arrObj, key) {
	let arr = [];
	arr.push(arrObj[0][key]);
	for(let i = 1; i < arrObj.length; i++) {
		if(arrObj[i - 1][key] != arrObj[i][key])
			arr.push(arrObj[i][key]);
	}
	return arr;
}