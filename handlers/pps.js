const formidable = require("formidable");

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let ppsService = require('../services/pps');

//страница получения оценок пользователя
exports.pageGetScores = function(req, res) {
    let user = req.session;
    ppsService.pageGetScores(user).then(result => {
        res.render("pps/page-get-scores", {name: user.name, position: user.position,
            infoUser: user, pageName: '/pps/get-my-score', ...result});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы добавления значений ПЭД
exports.pageAddValueKpi = function(req, res) {
    let user = req.session;
    ppsService.pageAddValueKpi(user).then(result => {
        res.render('pps/page-add-value', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы просмотра добавленных значений ПЭД
exports.pageGetValuesKpi = function(req, res) {
    let user = req.session;
    ppsService.pageGetValuesKpi(user).then(result => {
        res.render('pps/page-my-values',
            {infoUser: user, pageName: '/pps/get-values-kpi', ...result});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//Получение значения ПЭД
exports.pageGetValue = function(req, res) {
    let valId = req.params["valId"];
    let user = req.session;
    ppsService.pageGetValue(user, valId).then(result => {
        res.render('pps/page-one-value', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос уже добавленных значений ПЭД
exports.chooseKpiForAddValue = function(req, res) {
    let user = req.session;
    let nameKpi = req.body.name;
    ppsService.chooseKpiForAddValue(user, nameKpi).then(result => {
        res.render("pps/partials/choose-kpi-for-add-value", result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление значения одного ПЭД
exports.addValueKpi = function(req, res) {
    let user = req.session;
    let form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {
            if (err) return console.log(err);
            ppsService.addValueKpi(user, fields, files).then(result => {
                res.json(result);
            });
        });
    } catch (err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    }
};

//POST-запрос на изменение полей значения
exports.changeFieldVal = function(req, res) {
    let user = req.session;
    let form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {
            if (err) return console.log(err);
            ppsService.changeFieldVal(user, fields, files).then(result => {
                res.json(result);
            });
        });
    } catch (err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    }
};

//POST-запрос на удаление значения
exports.deleteVal = function(req, res) {
    let user = req.session;
    let id = req.body.id;
    ppsService.deleteVal(user, id).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};