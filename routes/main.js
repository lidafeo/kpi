const express = require("express");
const bodyParser = require("body-parser");

const routerChangeKpi = require("./router.change-kpi.js");
const routerChangeUsers = require("./router.change-users.js");
const routerChangePps = require("./router.change-pps.js");
const routerUpdateDb = require("./router.update-db.js");
const routerChangeRoles = require("./router.change-roles");
const routerChangeStructure = require("./router.change-structure.js");
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
	app.post('/verify', checkRight(["verify"]), jsonParser, handlers.verify.verify);

	app.get('/verify/val/:valId', checkRight(["verify"]), handlers.verify.pageValPps);

	app.post('/invalid', checkRight(["verify"]), jsonParser, handlers.verify.invalidValue);
	app.post('/cancel-invalid', checkRight(["verify"]), jsonParser, handlers.verify.cancelInvalidValue);
	app.post('/get-workers', checkRight(["verify"]), jsonParser, handlers.verify.getWorkers);
	app.post('/get-structure', checkRight(["verify"]), jsonParser, handlers.verify.getStructure);

	app.get('/pfu', checkRight(["create_report"]), handlers.createReport.pagePfu);
	app.post('/pfu', checkRight(["create_report"]), handlers.createReport.getReport);

	app.get('/get-actions-users', checkRight(["get_actions_users"]), handlers.getActionsUsers.pageGetActionsUsers);
    //app.get('/actions-users', handlers.getActionsUsers.pageGetActionsUsers);

	app.get('/get-users', checkRight(["get_all_users"]), handlers.getInfo.pageGetUsers);
	app.get('/get-pps', checkRight(["get_all_pps"]), handlers.getInfo.pageGetPps);
	app.get('/get-kpi', checkRight(["get_all_kpi"]), handlers.getInfo.pageGetAllKpi);
	app.get('/get-structure', checkRight(["get_structure"]), handlers.getInfo.pageGetStructure);
	app.get('/get-all-values', checkRight(["get_all_values_of_kpi"]), handlers.getInfo.pageGetAllValuesOfKpi);
	app.get('/get-all-roles', checkRight(["get_all_roles"]), handlers.getInfo.pageGetAllRoles);

	app.route('/set-period')
		.get(checkRight(["set_period"]), handlers.setPeriod.pageSetPeriod)
		.post(checkRight(["set_period"]), urlencodedParser, handlers.setPeriod.setPeriod);
	app.route('/close-accounts')
		.get(checkRight(["close_accounts"]), handlers.closeAccounts.pageCloseAccount)
		.post(checkRight(["close_accounts"]), urlencodedParser, handlers.closeAccounts.closeAccounts);

	app.post('/notify', checkRight(["set_period"]), handlers.setPeriod.notify);

	app.use('/change-kpi', checkRight(["change_kpi"]), routerChangeKpi);
	app.use('/change-users', checkRight(["change_user"]), routerChangeUsers);
	app.use('/change-pps', checkRight(["change_pps"]), routerChangePps);
	app.use('/change-roles', checkRight(["change_role"]), routerChangeRoles);
	app.use('/change-structure', checkRight(["change_structure"]), routerChangeStructure);
	app.use('/update-db', checkRight(["update_with_excel"]), routerUpdateDb);


	app.use(handlers.errors.notFound);
};