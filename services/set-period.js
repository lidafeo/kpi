let getObjPeriod = require('../modules/period.js').getObjPeriod;
let setNotify = require('../modules/period.js').setNotify;
let createActualPeriod = require('../modules/period.js').createActualPeriod;
let deletePeriod = require('../modules/period.js').deletePeriod;
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let dateForOut = require('../modules/date').dateForOut;

//запрос страницы установки текущего периода
exports.pageSetPeriod = async function(user) {
    let objPeriod = await getObjPeriod();
    let period = null;
    if(objPeriod && objPeriod.length > 0) {
        period = objPeriod[0];
        period.date1 = dateForOut(period.start_date);
        period.date2 = dateForOut(period.finish_date);
    }
    return {period: period, infoUser: user, pageName: '/set-period'};
};

//запрос на установку текущего периода
exports.setPeriod = async function(user, date1, date2, name) {
    let result = await createActualPeriod(date1, date2, name);
    console.log(result);
    if(result.insertId) {
        //записываем логи
        writeLogs(user.login, user.position, "установил(а) период для отчета с " +
            date1.split('-').reverse().join('.') + " по " + date2.split('-').reverse().join('.'));
        return true;
    }
};

//запрос для оповещения сотрудников о скором закрытии кабинетов
exports.notify = async function () {
    setNotify(true);
    return true;
};