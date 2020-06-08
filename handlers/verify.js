let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let verifyService = require('../services/verify');

//GET-запрос страницы проверки ПЭДов
exports.pageVerify = function(req, res) {
    let user = req.session;
    verifyService.pageVerify(user).then(result => {
        res.render('verify/page-verify', result);
    }).catch (err => {
        writeErrorLogs(req.session.login, err);
        console.log("Ошибка доступа", err);
        res.status(500).render('error/500');
    });
};

//Получение значения ПЭД
exports.pageValPps = function(req, res) {
    let valId = req.params["valId"];
    console.log('valId', valId);
    let user = req.session;
    verifyService.pageValPps(user, valId).then(result => {
        res.render('verify/page-val', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//получить сотрудников кафедры
exports.getWorkers = function(req, res) {
    let user = req.session;
    let faculty = req.body.faculty;
    let department = req.body.department;
    verifyService.getWorkers(user, faculty, department).then(result => {
        res.render('verify/partials/list-workers', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на получение таблицы для проверки значений ПЭД ППС
exports.verify = function(req, res) {
    let user = req.session;
    let login = req.body.name;
    verifyService.verify(user, login).then(result => {
        res.render("verify/partials/table-for-verify", result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на пометку значения ПЭД как недействительное
exports.invalidValue = function(req, res) {
    let invalidId = req.body.id;
    let invalidComment = req.body.comment;
    let user = req.session;
    verifyService.invalidValue(user, invalidId, invalidComment).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({'result': 'err'});
    });
};

//POST-запрос на отмену пометки недействительности значения ПЭД
exports.cancelInvalidValue = function(req, res) {
    let invalidId = req.body.id;
    let user = req.session;
    verifyService.cancelInvalidValue(user, invalidId).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({'result': 'err'});
    });
};

//получить структуру
exports.getStructure = function(req, res) {
    verifyService.getStructure().then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};