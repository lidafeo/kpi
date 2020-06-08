let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let getInfoService = require('../services/get-info');

//GET-запрос страницы получения списка ПЭД
exports.pageGetAllKpi = function(req, res) {
   let user = req.session;
   getInfoService.pageGetAllKpi(user).then(result => {
       res.render('table-pages/page-table-kpi', result);
   }).catch(err => {
       writeErrorLogs(req.session.login, err);
       console.log(err);
       req.status(500).render('error/500');
   });
};

//GET-запрос страницы со списком пользователей
exports.pageGetUsers = function(req, res) {
    let user = req.session;
    getInfoService.pageGetUsers(user).then(result => {
        res.render('table-pages/page-table-users', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        req.status(500).render('error/500');
    });
};

//GET-запрос страницы со списком ППС
exports.pageGetPps = function(req, res) {
    let user = req.session;
    getInfoService.pageGetPps(user).then(result => {
        res.render('table-pages/page-table-pps', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        req.status(500).render('error/500');
    });
};

//GET-запрос страницы с таблицей структуры университета
exports.pageGetStructure = function(req, res) {
    let user = req.session;
    getInfoService.pageGetStructure(user).then(result => {
        res.render('table-pages/page-table-structure', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        req.status(500).render('error/500');
    });
};

//GET-запрос страницы со списком значений ПЭД пользователей
exports.pageGetAllValuesOfKpi = function(req, res) {
    let user = req.session;
    getInfoService.pageGetAllValuesOfKpi(user).then(result => {
        res.render('table-pages/page-table-values', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы с таблицей ролей
exports.pageGetAllRoles = function(req, res) {
    let user = req.session;
    getInfoService.pageGetAllRoles(user).then(result => {
        res.render('table-pages/page-table-roles', result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};