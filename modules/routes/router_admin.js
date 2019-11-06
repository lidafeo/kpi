const express = require("express");

let admin = require('../handlers/admin.js');

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});

const adminRouter = express.Router();

const routerUser = express.Router();
const routerKpi = express.Router();

// admin/...
adminRouter.use(admin.checkadmin);

// admin/users
routerUser.get('/get_users', admin.getusers);
routerUser.route('/delete_user')
    .get(admin.deleteuser)
    .post(urlencodedParser, admin.POSTdeleteuser);
routerUser.route('/add_user')
    .get(admin.adduser)
    .post(urlencodedParser, admin.POSTadduser);
routerUser.route('/add_users_from_file')
    .get(admin.adduserfile)
    .post(urlencodedParser, admin.POSTadduserfile);

// admin/kpi
routerKpi.get('/get_kpi', admin.getkpi);
routerKpi.route('/add_kpi')
    .get(admin.addkpi)
    .post(urlencodedParser, admin.POSTaddkpi);
routerKpi.route('/delete_kpi')
    .get(admin.deletekpi)
    .post(urlencodedParser, admin.POSTdeletekpi);
routerKpi.route('/edit_balls')
    .get(admin.editballs)
    .post(urlencodedParser, admin.POSTeditballskpi);

adminRouter.use('/users', routerUser);
adminRouter.use('/kpi', routerKpi);
adminRouter.get('/get_balls_of_users', admin.getballusers);
adminRouter.get('/set_period', admin.setperiod);
adminRouter.get('/close_accounts', admin.closeaccount);
adminRouter.get('/', admin.main);

module.exports = adminRouter;

	
