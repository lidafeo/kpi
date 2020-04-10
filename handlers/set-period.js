
let getObjPeriod = require('../modules/period.js').getObjPeriod;
let setNotify = require('../modules/period.js').setNotify;
let setDate = require('../modules/period.js').setDate;
let deletePeriod = require('../modules/period.js').deletePeriod;
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//GET-запрос страницы установки текущего периода
exports.pageSetPeriod = function(req, res) {
    let objPeriod = getObjPeriod();
    res.render('page-set-period', {set: objPeriod.set, period: objPeriod,
        infoUser: req.session, pageName: '/set-period'});
};

//POST-запрос на установку текущего периода
exports.setPeriod = function(req, res) {
    let date1 = req.body.date1;
    let date2 = req.body.date2;
    if(!date1 || !date2) {
        deletePeriod();
        setNotify(false);
    }
    else {
        setDate(date1, date2);
        //записываем логи
        writeLogs(req.session.login, req.session.position, "установил(а) период для отчета с " +
            date1.split('-').reverse().join('.') + " по " + date2.split('-').reverse().join('.'));
    }
    res.redirect('/set-period');
};

//POST-запрос для оповещения сотрудников о скором закрытии кабинетов
exports.notify = function(req, res) {
    setNotify(true);
    res.redirect('/set-period');
};