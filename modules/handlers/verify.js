//Схемы БД
const User = require("../Scheme/users.js");
const KpiSchema = require("../Scheme/kpi.js");
const UserValue = require("../Scheme/uservalue.js");
const Structure = require("../Scheme/structure.js");

const fs = require("fs");

let dateToString = require('../date.js').dateToString;
let timeToString = require('../date.js').timeToString;
let cookieKpi = require('../writecookie.js').cookieKpi;

//страница проверки ПЭДов
exports.verify = function(req, res) {
	let level = req.session.level;
	let department = req.session.department;
	let faculty = req.session.faculty;
	Structure.findOne({faculty: faculty}, function(err, doc) {
		KpiSchema.find({}, function(err, kpi) {
			if(err) return console.log(err);
			let obj = cookieKpi(res, kpi);

			let propKpi = getPropKpi(obj);
			
			let dep = [];
			if (doc) dep = doc.department;
			else dep.push(department);
			User.find({level: {$lt: level}, department: {$in: dep}}, function(err, users) {
				res.render('verify', {section: propKpi.section, subtype: propKpi.subtype, 
					number: propKpi.number, worker: users, mypage: false});
			});
		});
	});
};

//страница проректора (проверка подтверждений ПЭДов)
exports.prorector = function(req, res) {
	let level = req.session.level;
	//if(req.session.level != 3) ;
	KpiSchema.find({}, function(err, kpi) {
		if(err) return console.log(err);
		let obj = cookieKpi(res, kpi);
		let propKpi = getPropKpi(obj);
		
		User.find({level: {$lt: level}}, function(err, users) {
			res.render('verify', {section: propKpi.section, subtype: propKpi.subtype, 
				number: propKpi.number, worker: users, mypage: true});
		});
	});
};

//проверка выполненных ПЭДов
exports.POSTverify = function(req, res) {
	let section = req.body.section;
	let subtype = req.body.subtype;
	let number = req.body.number;
	let userName = req.body.name;
	let positionNumber;
	let name;
	if(subtype) name = section[0] + '.' + subtype[0] + '.' + number;
	else name = section[0] + '.' + number;
	let prom = new Promise( function(resolve, reject) {
		User.findOne({name: userName}, function(err, user) {
			if(err) console.log(err);
			if(!user) return reject('Нет такого сотрудника');
			resolve(user.positionNumber);
		});
	});
	prom.then(function(positionNumber) {
		KpiSchema.findOne({name: name}, function(err, kpi) {
			if(err) return console.log(err);
			if(kpi.substrings[0].balls[positionNumber] != 0) {
				UserValue.find({nameUser: userName, nameKpi: name, invalid: false}, 
					function(err, uservalues) {
					if(err) return console.log(err);
					modifydate(uservalues);
					res.render("partials/verifyVal", {kpi: uservalues, desc: kpi,
						textErr: false});
				});
			}
			else {
				res.render("partials/verifyVal", {kpi: [], 
					textErr: "Этот ПЭД недоступен для этой должности"});
			}
		});
	}, function(err) {
		res.render("partials/verifyVal", {kpi: [], textErr: "Сотрудник не найден"});
	});
};

//помечаем ПЭДы как недействительные
exports.POSTinvalid = function(req, res) {
	let invalidKpi = req.body.kpi;
	let name = req.session.userName;
	console.log(invalidKpi);
	let prom = new Promise(function(resolve, reject) {
		for(let i = 0; i < invalidKpi.length; i++) {
			UserValue.findByIdAndUpdate(invalidKpi[i].id, {invalidInfo: 
				{text: invalidKpi[i].comment, author: name}, invalid: true}, function(err, doc) {
				if(err) reject('err');
				console.log('Обновленный объект ', doc);
				
				//записываем логи
				let date = new Date();
				let strTime = timeToString(date);
				let namefile = dateToString(date) + '.txt';
				let text = invalidKpi[i].comment.split(';').join('.');
				fs.appendFileSync("./logs/" + namefile, strTime + " " + name +
					" сделал(а) отметку о недействительности ПЭДа " + doc.nameKpi + " пользователя " + 
					doc.nameUser +" по следующей причине: " + text + ";\r\n");
			});
		}
		resolve('ok');
	});
	prom.then(function(result) {
		res.send(result);
	}, function(error) {
		res.send(error);
	});
};

//преобразование даты к нормальному виду
function modifydate(arrObj) {
	for(let i = 0; i < arrObj.length; i++) {
		modifyOneDate(arrObj[i], 'date');
		modifyOneDate(arrObj[i], 'startDate');
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

function getPropKpi(obj) {
	let section = [];
	let subtype = [];
	let number;
	for(key in obj) {
		if(section.indexOf(key.split('_')[0]) == -1)
			section.push(key.split('_')[0]);
		if(key.split('_')[0] == section[0]){
			subtype.push(key.split('_')[1]);
			if(key.split('_')[1] == subtype[0])
				number = obj[key];
		}
	}
	return {section: section, subtype: subtype, number: number};
}