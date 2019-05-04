const formidable = require("formidable");
const fs = require("fs");

//Схемы БД
const KpiSchema = require("../Scheme/kpi.js");
const UserValue = require("../Scheme/uservalue.js");

let dateToString = require('../date.js').dateToString;
let timeToString = require('../date.js').timeToString;
let dateForInput = require('../date.js').dateForInput;
let cookieKpi = require('../writecookie.js').cookieKpi;

//главная страница пользователя
exports.mypage = function(req, res) {
	let name = req.session.userName;
	//if(!name) res.redirect('/404');
	let position = req.session.userPosition;
	let level = req.session.level;
	let positionNumber = req.session.positionNumber;

	if(!(positionNumber + 1)) {
		console.log("У пользователя нет ПЭДов");  
		if(position == "Проректор") return res.redirect('/prorector');
		if(position == "Администратор") return res.redirect('/admin');
	}

	let date1 = req.query.date1;
	let date2 = req.query.date2;

	//Если период отчета не задан, устанавливаем
	if(!date1 || !date2) {
		let dt1 = new Date();
		let dt2 = new Date();
		dt1.setMonth(dt1.getMonth() - 6);
		date1 = dateForInput(dt1);
		date2 = dateForInput(dt2);
	}
	let d1 = new Date(date1);
	let d2 = new Date(date2);
	//ищем опубликованные значения ПЭДов в заданный период
	UserValue.find({nameUser: name, $or: [{startDate: {$lte: d2, $gte: d1}}, 
			{finishDate: {$lte: d2, $gte: d1}}, {startDate: {$lte: d1}, finishDate: {$gte: d2}}], 
			invalid: false}, 
		function(err, uservalues) {
		if(err) return console.log(err);
		if(uservalues.length == 0) {
			res.render("mypage", {name: name, position: position, kpi: null, date1: 
				date1, date2: date2, level: level});
		}
		else {
			//Формирование массива названий ПЭДов
			let namekpi = ArrOfKeyValues(uservalues, "nameKpi");
			let OD = []; let ND = []; let RD = [];

			KpiSchema.find({name: {$in: namekpi}}, function(err, kpi) {
				if(err) return console.log(err);
				if(kpi == null) return;
				//добавление к свойствам ПЭДов оценок пользователя
				for(let i = 0; i < kpi.length; i ++) {
					//добавление информации к ПЭДам и их сортировка
					sortKpi(kpi, uservalues, i);
					kpi[i].userball = calculateBall(kpi[i], positionNumber);
					//сортировка по разделам деятельности
					if(kpi[i].section == "Образовательная деятельность") OD.push(kpi[i]);
					if(kpi[i].section == "Научная деятельность") ND.push(kpi[i]);
					if(kpi[i].section == "Репутационная деятельность") RD.push(kpi[i]);
				}
				//устанавливаем правильный порядок вывода ПЭДов
				OD.sort(sortArr);
				ND.sort(sortArr);
				res.render("mypage", {name: name, position: position, kpi: [OD, ND, RD],
					date1: date1, date2: date2, level: level});
			});
		}
	});
};

//страница добавления значений ПЭДов
exports.editkpi = function(req, res) {
	let name = req.session.userName;
	let positionNumber = req.session.positionNumber;
	KpiSchema.find({}, function(err, docs) {
		if(err) return console.log(err);
		let obj = cookieKpi(res, docs);
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
		res.render('editkpi', {section: section, subtype: subtype, number: number});
	});
};

//прошлые подтверждения ПЭДА
exports.POSTeditkpi = function(req, res) {
	let section = req.body.section;
	let subtype = req.body.subtype;
	let number = req.body.number;
	let positionNumber = req.session.positionNumber;
	let UserName = req.session.userName;
	let name;
	if(subtype) name = section[0] + '.' + subtype[0] + '.' + number;
	else name = section[0] + '.' + number;
	console.log(name);
	KpiSchema.findOne({name: name}, function(err, kpi) {
		if(err) return console.log(err);
		if(kpi.substrings[0].balls[positionNumber] != 0) {
			UserValue.find({nameUser: UserName, nameKpi: name}, function(err, uservalues) {
				if(err) return console.log(err);
				modifydate(uservalues);
				res.render("partials/postedVal", {kpi: uservalues, desc: kpi,
					textErr: false});
			});
		}
		else {
			res.render("partials/postedVal", {kpi: [], textErr: true});
		}
	});
};

//отправка файла пользователю
exports.sendfiles = function(req, res) {
	let file = req.query.file;
	UserValue.findOne({_id: file}, function(err, doc) {
		res.download("./sendfiles/" + file + '.' + doc.file.split('.').pop(), doc.file);
	});	
};

//форма для отправки нового ПЭДа
exports.POSTplus = function(req, res) {
	let name = req.body.name;
	KpiSchema.findOne({name: name}, function(err, kpi) {
		if(err) return console.log(err);
		res.render('partials/fillform', {kpi: kpi});
	});
};

//отправка ПЭДа
exports.POSTupload = function(req, res) {
	let name = req.session.userName;
	let form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if(err) return console.log(err);
		console.log(fields);
		console.log(files);

		let filename = "";
		if(!files.file && fields.text == "" || +fields.value == 0 || fields.date == "") 
			return res.send('err');

		let radio = 0;
		if(fields.radio) radio = fields.radio;
		//находим в БД добавляемый ПЭД, чтобы узнать время его действия
		KpiSchema.findOne({name: fields.name}, function(err, kpi) {
			let finishDate = new Date(fields.date);
			if(files.file) filename = files.file.name;
			finishDate.setMonth(finishDate.getMonth() + kpi.implementationPeriod);
			let obj = {nameUser: name, nameKpi: fields.name, value: +fields.value, date: new Date(),
				startDate: new Date(fields.date), finishDate: finishDate, text: fields.text, 
				file: filename, number: radio};
			UserValue.create(obj, function(err, doc) {
				if(err) return console.log(err);
				console.log("Сохранен объект uservalue", doc);

				//записываем логи
				let date = new Date();
				let strTime = timeToString(date);
				let namefile = dateToString(date) + '.txt';
				fs.appendFileSync("./logs/" + namefile, strTime + " " + name + " добавил(а) " +
					"новое значение ПЭДа " + doc.nameKpi + " равное " + doc.value +";\r\n");

				res.send('ok');

				if(files.file) {
					filename = files.file.name;
					let ext=filename.split('.').pop();
					console.log(ext);
					let readableStream = fs.createReadStream(files.file.path);
					let writeableStream = fs.createWriteStream("./sendfiles/" +
						doc._id + '.' +ext);
					readableStream.pipe(writeableStream);
				}
			});
		});
	});
};


//сортировка и 
//добавление доп информации по ПЭДам: количество подтвержденных, балл, дата подтверждения
function sortKpi(kpi, uservalues, i) {
	for(let j = 0; j < uservalues.length; j++) {
		if(uservalues[j].nameKpi == kpi[i].name) {
			if(kpi[i].type == 1) {
				if(kpi[i].count) kpi[i].count++;
				else {
					kpi[i].count = 1;
					kpi[i].ball = [];
					kpi[i].date = [];
				}
			}
			else {
				if(!kpi[i].count) {
					kpi[i].count = [];
					kpi[i].ball = [];
					kpi[i].date = [];
					kpi[i].num = [];
					for(let k = 0; k < kpi[i].substrings.length; k++)
						kpi[i].count[k] = 0;
				}
				kpi[i].count[uservalues[j].number] ++;
			}
			kpi[i].ball.push(uservalues[j].value);
			kpi[i].date.push(uservalues[j].date);
			if (kpi[i].type == 2) {
				kpi[i].num.push(uservalues[j].number);
			}
		}
	}
}

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

//вычисление оценки
function calculateBall(kpi, positionNumber) {
	let value;
	let ball = [];
	//ставим оценку ПЭДу первого типа
	if(kpi.type == 1) {
		//находим балл
		value = getBall (kpi);
		//вычисляем оценку
		for(let i = 0; i < kpi.substrings.length; i++) {
			if(!kpi.substrings[i].criterion[1]) kpi.substrings[i].criterion.push(Infinity);
			if(value >= kpi.substrings[i].criterion[0] && value <= kpi.substrings[i].criterion[1]) {
				ball[0] = kpi.substrings[i].balls[positionNumber];
			}
			else if(!ball[0]) ball[0] = 0;
		}
	}
	//ставим оценку ПЭДу второго типа
	else {
		//находим и вычисляем оценку для каждой подстроки
		for(let i = 0; i < kpi.substrings.length; i++) {
			value = getBall(kpi, i);
			if(!kpi.substrings[i].criterion[1]) kpi.substrings[i].criterion.push(Infinity);
			if(value >= kpi.substrings[i].criterion[0] && value <= kpi.substrings[i].criterion[1]) {
				if(kpi.num[i] == i) 
					ball.push(kpi.substrings[i].balls[positionNumber]);
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
	if(kpi.indicatorsSumm) {
		if(kpi.type == 1) value = kpi.count;
		else value = kpi.count[k];
	}
	else {
		let date = new Date(0);	
		for(let i = 0; i < kpi.count; i++)
			if(kpi.type == 1 || kpi.type == 2 && kpi.num[i] == k)
				if(kpi.date[i] > date) {
					value = kpi.ball[i];
					date = kpi.date[i];
				}
	}
	return value;
}

//сортировка названий ПЭДов
function sortArr(a, b) {
	let num1 = + a.name.replace(/\D/g, "");
	let num2 = + b.name.replace(/\D/g, "");
	let str1 = a.name.replace(/\d/g, "");
	let str2 = b.name.replace(/\d/g, "");
	if(str1 == str2) return num1 - num2;
	else return (str1 > str2)? 1 : -1;
}

//Формирование массива значений одного ключа из массива объектов
function ArrOfKeyValues(arrObj, key) {
	let arr = [];
	arr.push(arrObj[0][key]);
	for(let i = 1; i < arrObj.length; i++) {
		if(arrObj[i - 1][key] != arrObj[i][key])
			arr.push(arrObj[i][key]);
	}
	return arr;
}
