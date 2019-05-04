let main = require('./handlers/main.js');
let user = require('./handlers/user.js');
let verify = require('./handlers/verify.js');
let admin = require('./handlers/admin.js');

const bodyParser = require("body-parser");
const express = require("express");
const jsonParser = express.json();

//Создаем парсер для данных application/..
const urlencodedParser = bodyParser.urlencoded({extended:false});

module.exports = function(app) {
	app.get('/', main.home);
	app.post('/user', urlencodedParser, main.auth);
	app.use(main.checksession);

	app.get('/mypage', user.mypage);
	app.get('/editkpi', urlencodedParser, user.editkpi);
	app.post('/editkpi', jsonParser, user.POSTeditkpi);
	app.get("/sendfiles", user.sendfiles);
	app.post('/plus', jsonParser, user.POSTplus);
	app.post('/upload', user.POSTupload);

	app.get('/verify', verify.verify);
	app.get('/prorector', verify.prorector);
	app.post('/verify', jsonParser, verify.POSTverify);
	app.post('/invalid', jsonParser, verify.POSTinvalid);

	const adminRouter = express.Router();
	adminRouter.use('/getusers', admin.getusers);
	adminRouter.use('/adduser', admin.adduser);
	adminRouter.use('/getkpi', admin.getkpi);
	adminRouter.use('/addkpi', admin.addkpi);
	adminRouter.use('/editballs', admin.editballs);
	adminRouter.use('/', admin.main);
	//сопоставляем роутер с конечной точкой '/admin'
	app.use('/admin', adminRouter);
	app.post('/adduser', urlencodedParser, admin.POSTadduser);
	app.post('/addkpi', urlencodedParser, admin.POSTaddkpi);
	app.post('/getfaculty', jsonParser, admin.POSTgetfaculty);
	app.post('/getdepartment', jsonParser, admin.POSTgetdepartment);

	app.post('/exit', main.exit);
}