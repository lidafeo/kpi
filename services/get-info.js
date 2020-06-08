let DB = require('../modules/db');

let getKpiObj = require('../modules/func-kpi').getKpiObj;
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let dateModule = require('../modules/date.js');
let getPeriod = require('../modules/period.js').getPeriod;

//запрос страницы получения списка ПЭД
exports.pageGetAllKpi = async function(user) {
    let result = await DB.kpi.selectAllKpiWithCriterion();
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
    return {kpi: kpi, positions: positions, infoUser: user, pageName: '/get-kpi'};
};

//запрос страницы со списком пользователей
exports.pageGetUsers = async function(user) {
    let users = await DB.users.selectAllUsers();
    return {users: users, infoUser: user, pageName: '/get-users'};
};

//запрос страницы со списком ППС
exports.pageGetPps = async function(user) {
    let users = await DB.users.selectAllPps();
    return {users: users, infoUser: user, pageName: '/get-pps'};
};

//запрос страницы с таблицей структуры университета
exports.pageGetStructure = async function(user) {
    let result = await DB.structure.selectStructureOrderByFaculty();
    let structure = {};
    for(let i = 0; i < result.length; i++) {
        if(!structure[result[i].faculty]) {
            structure[result[i].faculty] = [];
        }
        structure[result[i].faculty].push(result[i].department);
    }
    return {structure: structure, infoUser: user, pageName: '/get-structure'};
};

//запрос страницы со списком значений ПЭД пользователей
exports.pageGetAllValuesOfKpi = async function(user) {
    let period = await getPeriod();
    period.dateStart = dateModule.dateForOut(period.d1);
    period.dateFinish = dateModule.dateForOut(period.d2);
    let result = await DB.userValues.selectAllValueKpiInPeriod(period.date1, period.date2);
    for(let i = 0; i < result.length; i++) {
        result[i].date_str = dateModule.dateToString(result[i].date).split('_').join('.');
        result[i].start_date_str = dateModule.dateToString(result[i].start_date).split('_').join('.');
        result[i].finish_date_str = dateModule.dateToString(result[i].finish_date).split('_').join('.');
    }
    return {marks: result, period: period, infoUser: user, pageName: '/get-all-values'};
};

//запрос страницы с таблицей ролей
exports.pageGetAllRoles = async function(user) {
    let result = await DB.rightsRoles.selectAllRightsRolesOrderByRole();
    let roles = {};
    for(let i = 0; i < result.length; i++) {
        if(!roles[result[i].role]) {
            roles[result[i].role] = [];
        }
        roles[result[i].role].push({name: result[i].right_name, comment: result[i].comment});
    }
    return {roles: roles, infoUser: user, pageName: '/get-all-roles'};
};