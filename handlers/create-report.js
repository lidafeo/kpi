let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let createReportService = require('../services/create-report');

//страница ПФУ для создания отчета
exports.pagePfu = function(req, res) {
    let user = req.session;
    createReportService.pagePfu(user).then(result => {
        res.render('page-pfu', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//создание отчета
exports.getReport = function(req, res) {
    let user = req.session;
    createReportService.getReport(user, res).then(result => {})
        .catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.status(500).render('error/500');
        });
};