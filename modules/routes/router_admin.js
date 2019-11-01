const express = require("express");

let admin = require('../handlers/admin.js');

const adminRouter = express.Router();

const routerUser = express.Router();
const routerKpi = express.Router();

// admin/...
adminRouter.use(admin.checkadmin);

// admin/users
routerUser.get('/get_users', admin.getusers);
routerUser.get('/delete_user', admin.deleteuser);
routerUser.get('/add_user', admin.adduser);
routerUser.get('/add_users_from_file', admin.adduserfile);

// admin/kpi
routerKpi.get('/get_kpi', admin.getkpi);
routerKpi.get('/add_kpi', admin.addkpi);
routerKpi.get('/delete_kpi', admin.deletekpi);
routerKpi.get('/edit_balls', admin.editballs);

adminRouter.use('/users', routerUser);
adminRouter.use('/kpi', routerKpi);
adminRouter.get('/get_balls_of_users', admin.getballusers);
adminRouter.get('/set_period', admin.setperiod);
adminRouter.get('/close_accounts', admin.closeaccount);
adminRouter.get('/', admin.main);

module.exports = adminRouter;