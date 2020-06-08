let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let changeRolesService = require('../services/change-roles');

//GET-запрос страницы для добавления роли
exports.pageAddRole = function(req, res) {
    let user = req.session;
    changeRolesService.pageAddRole(user).then(result => {
        res.render('change-roles/page-add-role', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление роли
exports.addRole = function(req, res) {
    let user = req.session;
    console.log("Добавление роли");
    console.log(req.body);
    let rights = req.body.rights;
    let role = req.body.role;
    changeRolesService.addRole(user, role, rights).then(result => {
        res.json(result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};