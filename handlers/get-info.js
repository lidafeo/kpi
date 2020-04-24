let DB = require('../modules/db');

let getKpiObj = require('../modules/func-kpi').getKpiObj;
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let dateModule = require('../modules/date.js');

//GET-запрос страницы получения списка ПЭД
exports.pageGetAllKpi = function(req, res) {
    DB.kpi.selectAllKpiWithCriterion().then(result => {
        let section = [];
        let kpi = [];
        let positions = [];

        for(let i = 0; i < result.length; i++) {
            let name = result[i].name;
            let arr = [];
            while (i != result.length && name == result[i].name) {
                arr.push(result[i]);
                i++;
            }
            i--;
            let oneKpi = getKpiObj(arr, positions);
            if(section.indexOf(oneKpi.section) == -1) {
                section.push(oneKpi.section);
                kpi.push([]);
            }
            kpi[section.indexOf(oneKpi.section)].push(oneKpi);
        }
        res.render('table-pages/page-table-kpi', {kpi: kpi, positions: positions,
            infoUser: req.session, pageName: '/get-kpi'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        req.status(500).render('error/500');
    });
};

//GET-запрос страницы со списком пользователей
exports.pageGetUsers = function(req, res) {
    DB.users.selectAllUsers().then(users => {
        res.render('table-pages/page-table-users', {users: users, infoUser: req.session, pageName: '/get-users'});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        req.status(500).render('error/500');
    });
};

//GET-запрос страницы со списком ППС
exports.pageGetPps = function(req, res) {
    DB.users.selectAllPps().then(users => {
        res.render('table-pages/page-table-pps', {users: users,
            infoUser: req.session, pageName: '/get-pps'});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        req.status(500).render('error/500');
    });
};

//GET-запрос страницы с таблицей структуры университета
exports.pageGetStructure = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    DB.structure.selectStructureOrderByFaculty().then(result => {
        let structure = {};
        for(let i = 0; i < result.length; i++) {
            if(!structure[result[i].faculty]) {
                structure[result[i].faculty] = [];
            }
            structure[result[i].faculty].push(result[i].department);
        }
        res.render('table-pages/page-table-structure', {action: action, structure: structure,
            infoUser: req.session, pageName: '/get-structure'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        req.status(500).render('error/500');
    });
};

//GET-запрос страницы со списком значений ПЭД пользователей
exports.pageGetAllValuesOfKpi = function(req, res) {
    DB.userValues.selectAllValueKpi().then(result => {
        for(let i = 0; i < result.length; i++) {
            result[i].date_str = dateModule.dateToString(result[i].date).split('_').join('.');
            result[i].start_date_str = dateModule.dateToString(result[i].start_date).split('_').join('.');
            result[i].finish_date_str = dateModule.dateToString(result[i].finish_date).split('_').join('.');
        }
        res.render('table-pages/page-table-values', {balls: result, infoUser: req.session, pageName: '/get-all-values'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы с таблицей ролей
exports.pageGetAllRoles = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    DB.rightsRoles.selectAllRightsRolesOrderByRole().then(result => {
        let roles = {};
        for(let i = 0; i < result.length; i++) {
            if(!roles[result[i].role]) {
                roles[result[i].role] = [];
            }
            roles[result[i].role].push(result[i].right_name);
        }
        res.render('table-pages/page-table-roles', {action: action, roles: roles,
            infoUser: req.session, pageName: '/get-all-roles'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};