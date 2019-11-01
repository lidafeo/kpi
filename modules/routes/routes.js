let main = require('../handlers/main.js');
let user = require('../handlers/user.js');
let verify = require('../handlers/verify.js');
let pfu = require('../handlers/pfu.js');
let admin = require('../handlers/admin.js');

const express = require("express");
const bodyParser = require("body-parser");

const adminRouter = require("./router_admin.js");

const jsonParser = express.json();
//Создаем парсер для данных application/..
const urlencodedParser = bodyParser.urlencoded({extended:false});

module.exports = function(app) {
	app.get('/', main.home);

	app.post('/exit', main.exit);
	app.get('/exit', main.exit);

	app.post('/user', urlencodedParser, main.auth);
	app.use(main.checkaccount);
	app.use(main.checksession);

	app.get('/my_page', user.mypage);
	app.get('/my_page/edit_kpi', rightImplementKpi, user.editkpi);
	app.get('/my_page/values_kpi', rightImplementKpi, user.valuekpi);
	app.get('/upload_file', rightPpsOrVerify, user.sendfiles);
	app.post('/edit_kpi', jsonParser, user.POSTeditkpi);
	app.post('/upload', user.POSTupload);

	app.get('/verify', rightVerify, verify.verify);
	app.post('/verify', jsonParser, verify.POSTverify);
	app.post('/invalid', jsonParser, verify.POSTinvalid);
	app.post('/getworkers', jsonParser, verify.POSTgetworkers);
	app.post('/getstructure', jsonParser, verify.POSTgetstructure);

	app.get('/pfu', rightPfu, pfu.pfu);
	app.post('/pfu', pfu.getReport);

	app.use('/admin', adminRouter);

	//app.post('/adduser', urlencodedParser, admin.POSTadduser);
	//app.post('/adduserfile', urlencodedParser, admin.POSTadduserfile);
	//app.post('/deleteuser', urlencodedParser, admin.POSTdeleteuser);
	app.post('/closeaccount', urlencodedParser, admin.POSTcloseaccount);
	app.post('/openaccount', urlencodedParser, admin.POSTopenaccount);
	app.post('/set_period', urlencodedParser, admin.POSTsetperiod);
	app.post('/addkpi', urlencodedParser, admin.POSTaddkpi);
	//app.post('/deletekpi', urlencodedParser, admin.POSTdeletekpi);
	app.post('/edit_balls_kpi', urlencodedParser, admin.POSTeditballskpi);
	//app.post('/edit_balls', urlencodedParser, admin.POSTeditballs);


	app.post('/getlogs', jsonParser, admin.getlogs);
	app.post('/notify', jsonParser, admin.notify);

	app.use(main.notfound);
}

//проверка прав доступа к страницам

function rightImplementKpi (req, res, next) {
	if(req.session.rights.pps == 0) res.status(404).render("error/404");
	else next();
}

function rightVerify (req, res, next) {
	if(req.session.rights.head == 0) res.status(404).render("error/404");
	else next();
}

function rightPpsOrVerify (req, res, next) {
	if(req.session.rights.head == 0 && req.session.rights.pps == 0) res.status(404).render("error/404");
	else next();
}

function rightAdmin (req, res, next) {
	if(req.session.rights.admin == 0) res.status(404).render("error/404");
	else next();
}

function rightPfu (req, res, next) {
	if(req.session.rights.pfu == 0) res.status(404).render("error/404");
	else next();
}