const express = require("express");

let admin = require('../handlers/admin.js');

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});

const adminRouter = express.Router();

const routerUser = express.Router();
const routerKpi = express.Router();

// admin/...
adminRouter.use(admin.checkRightsAdmin);

// admin/users
routerUser.get('/get_users', admin.getUsers);
routerUser.route('/delete_user')
    .get(admin.deleteUser)
    .post(urlencodedParser, admin.POSTdeleteUser);
routerUser.route('/add_user')
    .get(admin.addUser)
    .post(urlencodedParser, admin.POSTaddUser);
routerUser.route('/add_users_from_file')
    .get(admin.addUsersFromFile)
    .post(urlencodedParser, admin.POSTaddUsersFromFile);
routerUser.route('/add_users_from_file2')
    .get(admin.addUsersFromFile2)
    .post(urlencodedParser, admin.POSTaddUsersFromFile2);

// admin/kpi
routerKpi.get('/get_kpi', admin.getKpi);
routerKpi.route('/add_kpi')
    .get(admin.addKpi)
    .post(urlencodedParser, admin.POSTaddKpi);
routerKpi.route('/delete_kpi')
    .get(admin.deleteKpi)
    .post(urlencodedParser, admin.POSTdeleteKpi);
routerKpi.route('/edit_balls')
    .get(admin.editBallsKpi)
    .post(urlencodedParser, admin.POSTeditBallsKpi);

routerKpi.route('/past_kpi')
    .get(admin.addPastKpi)
    .post(urlencodedParser, admin.POSTaddPastKpi);


adminRouter.use('/users', routerUser);
adminRouter.use('/kpi', routerKpi);

adminRouter.get('/get_structure', admin.getStructure);
adminRouter.route('/update_structure')
    .get(admin.updateStructure)
    .post(urlencodedParser, admin.POSTupdateStructure);

adminRouter.get('/get_balls_of_users', admin.getBallsUsers);
adminRouter.route('/set_period')
    .get(admin.setPeriod)
    .post(urlencodedParser, admin.POSTsetPeriod);
adminRouter.route('/close_accounts')
    .get(admin.closeAccount)
    .post(urlencodedParser, admin.POSTcloseAccounts);
adminRouter.route('/change_password')
    .get(admin.changePassword)
    .post(urlencodedParser, admin.POSTchangePassword);
//adminRouter.get('/close_accounts', admin.closeAccount);
adminRouter.get('/', admin.main);

//adminRouter.post('/close_accounts', urlencodedParser, admin.POSTcloseAccounts);
//adminRouter.post('/open_accounts', urlencodedParser, admin.POSTopenAccounts);
//app.post('/set_period', urlencodedParser, admin.POSTsetPeriod);
adminRouter.post('/edit_balls_kpi', urlencodedParser, admin.POSTeditBallsKpi);
//adminRouter.get('/getlogs', admin.main);
adminRouter.post('/notify', admin.notify);

module.exports = adminRouter;

	
