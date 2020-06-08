let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let closeAccountsService = require('../services/close-accounts');

//GET-запрос страницы закрытия/открытия кабинетов
exports.pageCloseAccount = function(req, res) {
    let user = req.session;
    closeAccountsService.pageCloseAccount(user).then(result => {
        res.render('page-close-accounts', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на закрытие личных кабинетов ППС
exports.closeAccounts = function(req, res) {
    let user = req.session;
    closeAccountsService.closeAccounts(user).then(result =>{
        res.redirect('/close-accounts');
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};