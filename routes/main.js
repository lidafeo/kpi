const express = require("express");
const bodyParser = require("body-parser");

const routerChangeKpi = require("./router.change-kpi.js");
const routerChangeUsers = require("./router.change-users.js");
const routerChangePps = require("./router.change-pps.js");
const routerUpdateDb = require("./router.update-db.js");
const routerChangeRoles = require("./router.change-roles");
//const routerChangeStructure = require("./router.change-structure.js");
const routerPps = require("./router.pps.js");

let handlers = require('../handlers/handlers');

const jsonParser = express.json();
//Создаем парсер для данных application/..
const urlencodedParser = bodyParser.urlencoded({extended:false});

let checkRight = require('../modules/check-right');

exports.routes = function(app) {
	app.get('/', handlers.auth.pageHome);
	app.post('/', urlencodedParser, handlers.auth.auth);

	app.post('/exit', handlers.auth.exit);
	app.get('/exit', handlers.auth.exit);

	app.use(handlers.auth.checkOpenAccount);
	app.use(handlers.auth.checkSession);

	app.get('/my-page', handlers.auth.myPage);
    app.get('/actions', handlers.choiceAction.pageChoiceAction);

	app.use('/pps', routerPps);

	app.get('/download-file', checkRight(["get_my_values_of_kpi", "verify"]), handlers.downloadFile.downloadFile);

	app.get('/settings', handlers.changeMyPassword.pageChangePassword);
	app.post('/settings', urlencodedParser, handlers.changeMyPassword.changePassword);

	app.get('/verify', checkRight(["verify"]), handlers.verify.pageVerify);
	app.post('/verify', jsonParser, handlers.verify.verify);

	app.get('/verify/val/:valId', checkRight(["verify"]), handlers.verify.pageValPps);

	app.post('/invalid', jsonParser, handlers.verify.invalidValue);
	app.post('/cancel-invalid', jsonParser, handlers.verify.cancelInvalidValue);
	app.post('/get-workers', jsonParser, handlers.verify.getWorkers);
	app.post('/get-structure', jsonParser, handlers.verify.getStructure);

	app.get('/pfu', checkRight(["create_report"]), handlers.createReport.pagePfu);
	app.post('/pfu', handlers.createReport.getReport);

	app.get('/get-actions-users', checkRight(["get_actions_users"]), handlers.getActionsUsers.pageGetActionsUsers);
    //app.get('/actions-users', handlers.getActionsUsers.pageGetActionsUsers);

	app.get('/get-users', handlers.getInfo.pageGetUsers);
	app.get('/get-pps', handlers.getInfo.pageGetPps);
	app.get('/get-kpi', handlers.getInfo.pageGetAllKpi);
	app.get('/get-structure', handlers.getInfo.pageGetStructure);
	app.get('/get-all-values', handlers.getInfo.pageGetAllValuesOfKpi);
	app.get('/get-all-roles', handlers.getInfo.pageGetAllRoles);

	app.route('/set-period')
		.get(handlers.setPeriod.pageSetPeriod)
		.post(urlencodedParser, handlers.setPeriod.setPeriod);
	app.route('/close-accounts')
		.get(handlers.closeAccounts.pageCloseAccount)
		.post(urlencodedParser, handlers.closeAccounts.closeAccounts);

	app.post('/notify', handlers.setPeriod.notify);

	app.use('/change-kpi', routerChangeKpi);
	app.use('/change-users', routerChangeUsers);
	app.use('/change-pps', routerChangePps);
	app.use('/change-roles', routerChangeRoles);
	app.use('/update-db', routerUpdateDb);


	app.use(handlers.errors.notFound);
};