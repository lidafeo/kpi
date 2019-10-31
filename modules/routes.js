let main = require('./handlers/main.js');
let user = require('./handlers/user.js');
let verify = require('./handlers/verify.js');
let admin = require('./handlers/admin.js');
let pfu = require('./handlers/pfu.js');

const bodyParser = require("body-parser");
const express = require("express");
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

	app.get('/mypage', user.mypage);
	app.get('/mypage/editkpi', rightImplementKpi, user.editkpi);
	app.get('/mypage/valuekpi', rightImplementKpi, user.valuekpi);
	app.get("/sendfiles", rightImplementKpi, user.sendfiles);
	app.post('/editkpi', jsonParser, user.POSTeditkpi);
	app.post('/upload', user.POSTupload);

	app.get('/verify', rightVerify, verify.verify);
	app.post('/verify', jsonParser, verify.POSTverify);
	app.post('/invalid', jsonParser, verify.POSTinvalid);
	app.post('/getworkers', jsonParser, verify.POSTgetworkers);
	app.post('/getstructure', jsonParser, verify.POSTgetstructure);

	app.get('/pfu', rightPfu, pfu.pfu);
	app.post('/pfu', pfu.getReport);

	const adminRouter = express.Router();
	adminRouter.use(admin.checkadmin);
	adminRouter.use('/getusers', admin.getusers);
	adminRouter.use('/deleteuser', admin.deleteuser);
	adminRouter.use('/adduser', admin.adduser);
	adminRouter.use('/adduserfile', admin.adduserfile);
	adminRouter.use('/getkpi', admin.getkpi);
	adminRouter.use('/addkpi', admin.addkpi);
	adminRouter.use('/deletekpi', admin.deletekpi);
	adminRouter.use('/editballs', admin.editballs);
	adminRouter.use('/getballusers', admin.getballusers);
	adminRouter.use('/setperiod', admin.setperiod);
	adminRouter.use('/closeaccount', admin.closeaccount);
	adminRouter.use('/', admin.main);
	//сопоставляем роутер с конечной точкой '/admin'
	app.use('/admin', adminRouter);
	
	app.post('/adduser', urlencodedParser, admin.POSTadduser);
	app.post('/adduserfile', urlencodedParser, admin.POSTadduserfile);
	app.post('/deleteuser', urlencodedParser, admin.POSTdeleteuser);
	app.post('/closeaccount', urlencodedParser, admin.POSTcloseaccount);
	app.post('/openaccount', urlencodedParser, admin.POSTopenaccount);
	app.post('/setperiod', urlencodedParser, admin.POSTsetperiod);
	app.post('/addkpi', urlencodedParser, admin.POSTaddkpi);
	app.post('/deletekpi', urlencodedParser, admin.POSTdeletekpi);
	app.post('/editballskpi', urlencodedParser, admin.POSTeditballskpi);
	app.post('/editballs', urlencodedParser, admin.POSTeditballs);
	//app.post('/getfaculty', jsonParser, admin.POSTgetfaculty);
	app.post('/getlogs', jsonParser, admin.getlogs);
	app.post('/notify', jsonParser, admin.notify);
	//app.post('/getdepartment', jsonParser, admin.POSTgetdepartment);

	app.use(main.notfound);
}

//проверка прав доступа к страницам

function rightImplementKpi (req, res, next) {
	if(req.session.rights.pps == 0) res.status(404).render("404");
	else next();
}

function rightVerify (req, res, next) {
	if(req.session.rights.head == 0) res.status(404).render("404");
	else next();
}

function rightAdmin (req, res, next) {
	if(req.session.rights.admin == 0) res.status(404).render("404");
	else next();
}

function rightPfu (req, res, next) {
	if(req.session.rights.pfu == 0) res.status(404).render("404");
	else next();
}