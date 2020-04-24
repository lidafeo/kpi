
let getObjPeriod = require('../modules/period.js').getObjPeriod;
let setNotify = require('../modules/period.js').setNotify;
let createActualPeriod = require('../modules/period.js').createActualPeriod;
let deletePeriod = require('../modules/period.js').deletePeriod;
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let dateForOut = require('../modules/date').dateForOut;

//GET-запрос страницы установки текущего периода
exports.pageSetPeriod = function(req, res) {
    getObjPeriod().then(objPeriod => {
        let period = null;
        if(objPeriod && objPeriod.length > 0) {
            period = objPeriod[0];
            period.date1 = dateForOut(period.start_date);
            period.date2 = dateForOut(period.finish_date);
        }
        res.render('page-set-period', {period: period,
            infoUser: req.session, pageName: '/set-period'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на установку текущего периода
exports.setPeriod = function(req, res) {
    let date1 = req.body.date1;
    let date2 = req.body.date2;
    let name = req.body.name_period;

    createActualPeriod(date1, date2, name).then(result => {
        console.log(result);
        if(result.insertId) {
            //записываем логи
            writeLogs(req.session.login, req.session.position, "установил(а) период для отчета с " +
                date1.split('-').reverse().join('.') + " по " + date2.split('-').reverse().join('.'));
            res.redirect('/set-period');
        }
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос для оповещения сотрудников о скором закрытии кабинетов
exports.notify = function(req, res) {
    setNotify(true);
    res.redirect('/set-period');
};