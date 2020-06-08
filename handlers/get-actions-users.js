let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let getActionsUsersService = require('../services/get-actions-users');

//GET-запрос страницы просмотра действий пользователей
exports.pageGetActionsUsers = function(req, res) {
    let user = req.session;
    let date = req.query.date;
    getActionsUsersService.pageGetActionsUsers(user, date, result => {
        res.render('page-get-actions-users', result);
    }).then(result => {}).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};