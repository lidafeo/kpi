let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcValueOfKpi = require('../modules/func-value-of-kpi');
let funcStructure = require('../modules/func-structure');
let getPeriod = require('../modules/period.js').getPeriod;
let dateModule = require('../modules/date.js');

//запрос страницы проверки ПЭДов
exports.pageVerify = async function(user) {
    let level = user.level;
    if(!user.position) {
        level = 10;
    }
    let structure = await funcStructure.getFacultyForVerify(level, user.faculty, user.department);
     return {faculty: structure.faculty, department: structure.department,
         infoUser: user, pageName: '/verify'
     };
};

//Получение значения ПЭД
exports.pageValPps = async function(user, valId) {
    let level = user.level;
    if(!user.position) {
        level = 10;
    }
    let department = user.department;
    let faculty = user.faculty;
    let result = await DB.userValues.selectValueKpiByIdForVerify(valId);
    funcValueOfKpi.modifyDateOfValue(result);
    let structure = await funcStructure.getFacultyForVerify(level, faculty, department);
    let val = null;
    if(level == 10 || (level == 2 && structure.faculty.indexOf(result[0].faculty) !== -1)
        || (level == 1 && structure.department.indexOf(result[0].department) !== -1)) {
        val = result[0];
    }
    console.log('val', val);
    return {val: val, infoUser: user, pageName: '/verify/val'};
};

//получить сотрудников кафедры
exports.getWorkers = async function(user, faculty, department) {
    let level = user.level;
    if(!user.position) {
        level = 10;
    }
    let result = await DB.users.selectUserFromDepartment(faculty, department, level);
    return {worker: result};
};

//запрос на получение таблицы для проверки значений ПЭД ППС
exports.verify = async function(user, login) {
    //находим значения ПЭД выбранного сотрудника
    let period = await getPeriod();
    period.dateStart = dateModule.dateForOut(period.d1);
    period.dateFinish = dateModule.dateForOut(period.d2);
    let result = await DB.userValues.selectAllValueKpiUserInPeriodOrderByDate(login, period.date1, period.date2);
    if(result.length == 0) {
        return {kpi: [], period: period, textErr: "Нет добавленных действительных значений"};
    }
    funcValueOfKpi.modifyDateOfValue(result);
    return {kpi: result, period: period, textErr: false};
};

//запрос на пометку значения ПЭД как недействительное
exports.invalidValue = async function(user, invalidId, invalidComment) {
    let result = await DB.userValues.updateValueInvalid(invalidId, user.login, invalidComment);
    console.log(result);
    //записываем логи
    writeLogs(user.login, user.position, "сделал(а) отметку о недействительности значения ПЭД с id " +
        invalidId + " по следующей причине: " + invalidComment);
    return {"result": 'ok', "login": user.login};
};

//запрос на отмену пометки недействительности значения ПЭД
exports.cancelInvalidValue = async function (user, invalidId) {
    let result = await DB.userValues.updateValueCancelInvalid(invalidId, user.login);
    //записываем логи
    writeLogs(user.login, user.position, "сделал(а) значения ПЭД с id" +
        invalidId + " действительной (отмена отметки)");
    return {"result": 'ok', "login": user.login};
};

//получить структуру
exports.getStructure = async function() {
    let result = await DB.structure.selectStructure();
    let structure = {faculty: [], department: []};
    for(let i = 0; i < result.length; i ++) {
        if(structure.faculty.indexOf(result[i].faculty) == -1) {
            structure.faculty.push(result[i].faculty);
            structure.department[structure.faculty.indexOf(result[i].faculty)] = [];
        }
        structure.department[structure.faculty.indexOf(result[i].faculty)].push(result[i].department);
    }
    return structure;
};