let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let changeMyPasswordService = require('../services/change-my-password');

//GET-запрос страницы изменения пароля
exports.pageChangePassword = function(req, res) {
    res.render('page-settings', {action: 0, infoUser: req.session, pageName: '/settings'});
};

//POST-запрос для смены пароля
exports.changePassword = function(req, res) {
    let password = req.body.password;
    let user = req.session;
    changeMyPasswordService.changePassword(user, password).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};