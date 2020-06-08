let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let getClose = require('../modules/period').getObjClose;
let setClose = require('../modules/period').setClose;

//запрос страницы закрытия/открытия кабинетов
exports.pageCloseAccount = async function(user) {
    let close = getClose();
    if(close) {
        return {op: false, infoUser: user, pageName: '/close-accounts'};
    }
    return {op: true, infoUser: user, pageName: '/close-accounts'};
};

//запрос на закрытие личных кабинетов ППС
exports.closeAccounts = async function(user) {
    let close = getClose();
    //открываем
    if(close) {
        writeLogs(user.login, user.position, "открыл(а) личные кабинеты ППС");
        setClose(false);
    }
    //закрываем
    else {
        writeLogs(user.login, user.position, "закрыл(а) личные кабинеты ППС");
        setClose(true);
    }
    return true;
};