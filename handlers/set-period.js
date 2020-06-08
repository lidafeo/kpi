let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let setPeriodService = require('../services/set-period');

//GET-запрос страницы установки текущего периода
exports.pageSetPeriod = function(req, res) {
    let user = req.session;
    setPeriodService.pageSetPeriod(user).then(result => {
        res.render('page-set-period', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на установку текущего периода
exports.setPeriod = function(req, res) {
    let user = req.session;
    let date1 = req.body.date1;
    let date2 = req.body.date2;
    let name = req.body.name_period;
    setPeriodService.setPeriod(user, date1, date2, name).then(result => {
        res.redirect('/set-period');
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос для оповещения сотрудников о скором закрытии кабинетов
exports.notify = function(req, res) {
    setPeriodService.notify().then(result => {
        res.redirect('/set-period');
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};