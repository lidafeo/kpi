const fs = require("fs");
//Схемы БД
const User = require("../Scheme/users.js");
const Position = require("../Scheme/positions.js");
const Structure = require("../Scheme/structure.js");
const KpiSchema = require("../Scheme/kpi.js");

let dateToString = require('../date.js').dateToString;
let timeToString = require('../date.js').timeToString;
let dateForInput = require('../date.js').dateForInput;

//определяем маршруты и их обработчики внутри роутера

//получение списка работников
exports.getusers = function(req, res) {
	User.find({}, function(err, users) {
		res.render('admin/listusers', {users: users});
	});
}

//добавление сотрудника
exports.adduser = function(req, res) {
	if(req.session.level != 10) return res.redirect('404');
	let add = 0;
	if(req.query.add == 'ok') add = 1;
	if(req.query.add == 'err') add = 2;
	Position.find({}, function(err, pos) {
		Structure.find({}, function(err, doc) {
			res.render('admin/adduser', {positions: pos, add: add});
		});
	});
};

//получение списка ПЭДов
exports.getkpi = function(req, res) {
	KpiSchema.find({}, function(err, docs) {
		let section = [];
		let kpi = [];
		for(let i = 0; i < docs.length; i++) {
			if(section.indexOf(docs[i].section) == -1){
				section.push(docs[i].section);
				kpi.push([]);
			}
		}
		section.sort();
		for(let i = 0; i < docs.length; i++) {
			kpi[section.indexOf(docs[i].section)].push(docs[i]);
		}

		res.render('admin/listkpi', {kpi: kpi});
	});
}

//добавление ПЭДа
exports.addkpi = function(req, res) {
	KpiSchema.find({}, function(err, docs) {
		let section = [];
		for(let i = 0; i < docs.length; i++)
			if(section.indexOf(docs[i].section) == -1)
				section.push(docs[i].section);
		res.render('admin/addkpi', {section: section});
	});
};

//изменение оценок ПЭДа
exports.editballs = function(req, res) {
	res.render('admin/editballs');
};

//страница администратора
exports.main = function(req, res) {
	let dateLogs = req.query.date;
	if(req.session.level != 10) return res.redirect('404');
	let date = new Date();
	let strDate = dateToString(date);
	let dateHTML = dateForInput(date);
	let namefile = strDate.split('.').join('_') + '.txt';
	fs.readFile("./logs/" + namefile, "utf8", function(err, data) {
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


//добавление пользователя
exports.POSTadduser = function(req, res) {
	let name = req.body.name;
	let position = req.body.position;
	let faculty = req.body.faculty;
	let department = req.body.department;
	let login = req.body.login;
	let password = req.body.password;
	let user = {name: name, position: position, login: login, password: password};
	if(faculty != "") user.faculty = faculty;
	if(department != "") user.department = department;
	Position.findOne({position: position}, function(err, pos) {
		if(err) return console.log(err);
		user.level = pos.level;
		if(pos.positionNumber) user.positionNumber = pos.positionNumber;
		console.log(user);
		User.findOne({$or: [{name: name}, {login: login}]}, function(err, doc) {
			if(err) return console.log(err);
			if(doc) return res.redirect('admin/adduser?add=err');
			User.create(user, function(err, doc) {
				if(err) return console.log(err);
				console.log("Сохранен объект user", doc);
				res.redirect('/admin/adduser?add=ok');
			});
		});
	});
};

//добавление ПЭДа
exports.POSTaddkpi = function(req, res) {
	KpiSchema.findOne({name: name}, function(err, doc) {
		if(err) return console.log(err);
		if(doc) return res.redirect('admin/addkpi?add=err');
		let kpi = {name: req.body.name, section: req.body.section, subtype: req.body.subtype}
		KpiSchema.create()
	})
	KpiSchema.create()
	//res.send('ADD KPI');
	//res.redirect('/admin/adduser');
};

//
exports.POSTgetfaculty = function(req, res) {
	Structure.find({}, function(err, doc) {
		let faculty = [];
		for(let i = 0; i < doc.length; i++)
			faculty.push(doc[i].faculty);
		res.send(faculty.join('_,'));
	});
};

//
exports.POSTgetdepartment = function(req, res) {
	Structure.find({}, function(err, doc) {
		let department = [];
		for(let i = 0; i < doc.length; i++)
			department = department.concat(doc[i].department);
		res.send(department.join('_,'));
	});
};