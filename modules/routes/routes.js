let main = require('../handlers/main.js');
let user = require('../handlers/user.js');
let verify = require('../handlers/verify.js');
let pfu = require('../handlers/pfu.js');

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
	app.use(main.checkAccount);
	app.use(main.checkSession);

	app.get('/my-page', user.myPage);
	app.get('/my-page/edit-kpi', rightImplementKpi, user.editKpi);
	app.get('/my-page/values-kpi', rightImplementKpi, user.valueKpi);
	app.get('/upload-file', rightPpsOrVerify, user.sendFile);
	app.get('/my-page/val/:valId', rightPpsOrVerify, user.getValue);
	app.get('/my-page/settings', rightPpsOrVerify, user.settings);
	app.post('/edit-kpi', jsonParser, user.POSTeditKpi);
	app.post('/upload', user.POSTupload);
	app.post('/my-page/settings', urlencodedParser, user.POSTsettings);

	app.get('/verify', rightVerify, verify.verify);
	app.get('/verify/val/:valId', rightVerify, verify.getValPps);
	app.post('/verify', jsonParser, verify.POSTverify);
	app.post('/invalid', jsonParser, verify.POSTinvalid);
	app.post('/get-workers', jsonParser, verify.POSTgetWorkers);
	app.post('/getstructure', jsonParser, verify.POSTgetStructure);

	app.get('/pfu', rightPfu, pfu.pfu);
	app.post('/pfu', pfu.getReport);

	app.use('/admin', adminRouter);

	app.use(main.notFound);
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