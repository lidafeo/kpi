let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let changeKpiService = require('../services/change-kpi');

//GET-запрос страницы добавления одного ПЭД
exports.pageAddKpi = function(req, res) {
    let user = req.session;
    changeKpiService.pageAddKpi(user).then(result => {
        res.render('change-kpi/page-add-kpi', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы выбора ПЭД для изменения
exports.pageChoiceKpi = function(req, res) {
    let user = req.session;
    changeKpiService.pageChoiceKpi(user).then(result => {
        res.render('change-kpi/page-choice-kpi', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы изменения ПЭД
exports.pageEditKpi = function(req, res) {
    let user = req.session;
    let kpi = req.query.name;
    console.log(kpi);
    changeKpiService.pageEditKpi(user, kpi).then(result => {
        res.render('change-kpi/page-edit-kpi', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление одного ПЭД
exports.addKpi = function(req, res) {
    let user = req.session;
    let kpi = req.body;
    changeKpiService.addKpi(user, kpi).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на удаление одного ПЭД
exports.deleteKpi = function(req, res) {
    let user = req.session;
    let kpi = req.body.name;
    changeKpiService.deleteKpi(user, kpi).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: 'Не удалось удалить Показатель эффективности деятельности ' + req.body.name});
    });
};

//POST-запрос на изменение одного ПЭД
exports.editKpi = function(req, res) {
    console.log(req.body);
    let user = req.session;
    let kpi = req.body;
    changeKpiService.editKpi(user, kpi).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: 'Не удалось изменить Показатель эффективности деятельности ' + kpi.name});
    });
};