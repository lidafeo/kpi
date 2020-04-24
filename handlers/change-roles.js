let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//GET-запрос страницы для добавления роли
exports.pageAddRole = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    DB.rights.selectAllRights().then(rights => {
        res.render('change-roles/page-add-role', {rights: rights, action: action,
            infoUser: req.session, pageName: '/change-roles/add-role'});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление роли
exports.addRole = function(req, res) {
    console.log("Добавление роли");
    console.log(req.body);
    let rights = req.body.rights;
    let role = req.body.role;
    try {
        DB.roles.insertRole(role).then(result => {
            //записываем логи
            writeLogs(req.session.login, req.session.position, "добавил(а) роль " + role);
            if (rights && rights.length > 0) {
                Promise.all(rights.map(el => {
                    DB.rightsRoles.insertRightsInRole(el, role);
                })).then(result => {
                    //записываем логи
                    writeLogs(req.session.login, req.session.position, "добавил(а) права роли " + role);
                    res.redirect('/change-roles/add-role?action=ok');
                });
            } else {
                res.redirect('/change-roles/add-role?action=ok');
            }
        });
    } catch (e) {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    }
};