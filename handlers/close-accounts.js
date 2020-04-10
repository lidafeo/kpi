let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let getClose = require('../modules/period').getObjClose;
let setClose = require('../modules/period').setClose;

//GET-запрос страницы закрытия/открытия кабинетов
exports.pageCloseAccount = function(req, res) {
    let close = getClose();
    if(close) res.render('page-close-accounts', {op: false,
        infoUser: req.session, pageName: '/close-accounts'});
    else res.render('page-close-accounts', {op: true,
        infoUser: req.session, pageName: '/close-accounts'});
};

//POST-запрос на закрытие личных кабинетов ППС
exports.closeAccounts = function(req, res) {
    let close = getClose();
    //открываем
    if(close) {
        writeLogs(req.session.login, req.session.position, "открыл(а) личные кабинеты ППС");
        setClose(false);
    }
    //закрываем
    else {
        writeLogs(req.session.login, req.session.position, "закрыл(а) личные кабинеты ППС");
        setClose(true);
    }
    res.redirect('/close-accounts');
};