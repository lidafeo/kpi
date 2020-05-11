let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcValueOfKpi = require('../modules/func-value-of-kpi');
let funcStructure = require('../modules/func-structure');

//GET-запрос страницы проверки ПЭДов
exports.pageVerify = function(req, res) {
    let level = req.session.level;
    let department = req.session.department;
    let position = req.session.position;
    if(!position) {
        level = 10;
    }
    let faculty = req.session.faculty;
    try {
        funcStructure.getFacultyForVerify(level, faculty, department).then(structure => {
            res.render('verify/page-verify', {faculty: structure.faculty,
                department: structure.department,
                infoUser: req.session, pageName: '/verify'});
        });
    } catch (err) {
        writeErrorLogs(req.session.login, err);
        console.log("Ошибка доступа", err);
        res.status(500).render('error/500');
    }
};

//Получение значения ПЭД
exports.pageValPps = function(req, res) {
    let valId = req.params["valId"];
    console.log('valId', valId);
    let level = req.session.level;
    if(!req.session.position) {
        level = 10;
    }
    let department = req.session.department;
    let faculty = req.session.faculty;
    DB.userValues.selectValueKpiByIdForVerify(valId).then(result => {
        //if(!result[0]) {
        //	res.render('pps/page_one_val', {val: result[0]});
        //}
        funcValueOfKpi.modifyDateOfValue(result);
        funcStructure.getFacultyForVerify(level, faculty, department).then(structure => {
            let val = null;
            if(level == 10 ||
                (level == 2 && structure.faculty.indexOf(result[0].faculty) !== -1) ||
                (level == 1 && structure.department.indexOf(result[0].department) !== -1)) {
                //if(result[0] && structure.faculty.indexOf(result[0].faculty) !== -1 &&
                //	structure.department.indexOf(result[0].department) !== -1) {
                val = result[0];
            }
            console.log('val', val);
            res.render('verify/page-val', {val: val,
                infoUser: req.session, pageName: '/verify/val'});
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//получить сотрудников кафедры
exports.getWorkers = function(req, res) {
    let level = req.session.level;
    let faculty = req.body.faculty;
    let department = req.body.department;
    console.log('--------');
    console.log(req.body);
    if(!req.session.position) {
        level = 10;
    }
    DB.users.selectUserFromDepartment(faculty, department, level).then(result => {
        res.render('verify/partials/list-workers', {worker: result});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на получение таблицы для проверки значений ПЭД ППС
exports.verify = function(req, res) {
    let login = req.body.name;
    console.log("00000");
    console.log(login);
    //находим значения ПЭД выбранного сотрудника
    DB.userValues.selectValueKpiByLogin(login).then(result => {
        if(result.length == 0) {
            res.render("verify/partials/table-for-verify", {kpi: [], textErr: "Нет добавленных действительных значений"});
        }
        else {
            funcValueOfKpi.modifyDateOfValue(result);
            res.render("verify/partials/table-for-verify", {kpi: result, textErr: false});
        }
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
    let login = req.session.login;
    DB.userValues.updateValueInvalid(invalidId, login, invalidComment).then(result => {
        console.log(result);
        //записываем логи
        writeLogs(login, req.session.position, "сделал(а) отметку о недействительности значения ПЭД с id " +
            invalidId + " по следующей причине: " + invalidComment);
        res.json({"result": 'ok', "login": login});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({'result': 'err'});
    });
};

//POST-запрос на отмену пометки недействительности значения ПЭД
exports.cancelInvalidValue = function(req, res) {
    let invalidId = req.body.id;
    let login = req.session.login;
    DB.userValues.updateValueCancelInvalid(invalidId, login).then(result => {
        //записываем логи
        writeLogs(login, req.session.position, "сделал(а) значения ПЭД с id" +
            invalidId + " действительной (отмена отметки)");
        res.json({"result": 'ok', "login": login});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({'result': 'err'});
    });
};

//получить структуру
exports.getStructure = function(req, res) {
    DB.structure.selectStructure().then(result => {
        let structure = {faculty: [], department: []};
        for(let i = 0; i < result.length; i ++) {
            if(structure.faculty.indexOf(result[i].faculty) == -1) {
                structure.faculty.push(result[i].faculty);
                structure.department[structure.faculty.indexOf(result[i].faculty)] = [];
            }
            structure.department[structure.faculty.indexOf(result[i].faculty)].push(result[i].department);
        }
        res.json(structure);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};