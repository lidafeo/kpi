//функции работы с БД
let DBs = require('../modules/db/select.js');
let DBi = require('../modules/db/insert.js');
let DBd = require('../modules/db/delete.js');
let DBu = require('../modules/db/update.js');

let getKpiObj = require('../modules/func-kpi').getKpiObj;
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//GET-запрос страницы добавления одного ПЭД
exports.pageAddKpi = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    DBs.selectAllSection().then(section => {
        DBs.selectPositions().then(positions => {
            res.render('change-kpi/page-add-kpi', {section: section, action: action, positions: positions,
                infoUser: req.session, pageName: '/change-kpi/add-kpi'});
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.status(500).render('error/500');
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы удаления ПЭДа
exports.pageDeleteKpi = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    DBs.selectAllKpi().then(result => {
        res.render('change-kpi/page-delete-kpi', {kpi: result, action: action,
            infoUser: req.session, pageName: '/change-kpi/delete-kpi'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы изменения оценок одного ПЭД
exports.pageEditBallsKpi = function(req, res) {
    let action = 0;
    let kpi = req.query.name;
    if(kpi) {
        DBs.selectOneKpiWithBalls(kpi).then(result => {
            let positions = [];
            let kpi = getKpiObj(result, positions);
            res.render('change-kpi/page-edit-balls-kpi', {choose: true, arr: kpi.lines, positions: kpi.positions,
                count_criterion: result[0].count_criterion, type: result[0].type, name: result[0].name,
                description: result[0].description, infoUser: req.session, pageName: '/change-kpi/edit-balls'});
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.status(500).render('error/500');
        });
    }
    else {
        if(req.query.action == 'ok') action = 1;
        if(req.query.action == 'err') action = 2;
        DBs.selectAllKpi().then(result => {
            res.render('change-kpi/page-edit-balls-kpi', {kpi: result, choose: false, action: action,
                infoUser: req.session, pageName: '/change-kpi/edit-balls'});
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.status(500).render('error/500');
        });
    }
};

//POST-запрос на добавление одного ПЭД
exports.addKpi = function(req, res) {
    let indicatorSum, subtype = req.body.subtype;
    if(req.body.indicatorssumm == 'true') indicatorSum = 1;
    else indicatorSum = 0;
    if(req.body.subtype == '-') subtype = null;

    DBs.selectPositions().then(positions => {
        //insertKpi (name, section, subtype, number, count_criterion, description, type, indicator_sum, action_time)
        DBi.insertKpi(req.body.name, req.body.section, subtype, +req.body.number, +req.body.count,
            req.body.desc, +req.body.type, indicatorSum, +req.body.implementationPeriod).then(result => {
            console.log("Добавлен ПЭД", req.body.name);

            //теперь добавляем критерри ПЭД в БД
            let criterions = [];

            let typeCriterion, n, a, b, nameCriterion, description, startVal, finalVal;
            if(+req.body.count == 1) {
                typeCriterion = req.body.typecrit;
                n = +req.body.n;
                a = +req.body.a;
                b = +req.body.b;
                nameCriterion = req.body.namecriterion;
                description = req.body.description;
                if(!nameCriterion) nameCriterion = req.body.typecrit;
            }

            //собираем массив объектов с информацией о критериях
            for(let i = 0; i < +req.body.count; i++) {

                let ballsArr = [];
                let criterion = {};

                if(+req.body.count != 1) {
                    typeCriterion = req.body.typecrit[i];
                    n = +req.body.n[i];
                    a = +req.body.a[i];
                    b = +req.body.b[i];
                    nameCriterion = req.body.namecriterion[i];
                    description = req.body.description[i];
                    if(!nameCriterion) nameCriterion = req.body.typecrit[i];
                }
                if(req.body.type == '1')
                    description = null;

                if(typeCriterion == 'Да/Нет') {
                    startVal = 1;
                    finalVal = null;
                }
                if(typeCriterion == 'Не менее n') {
                    startVal = n;
                    finalVal = null;
                }
                if(typeCriterion == 'От a до b') {
                    startVal = a;
                    finalVal = b;
                }

                criterion.name_kpi = req.body.name;
                criterion.name_criterion = nameCriterion;
                criterion.number_criterion = i;
                criterion.description = description;
                criterion.start_val = startVal;
                criterion.final_val = finalVal;
                console.log(req.body);
                for(let j = 0; j < positions.length; j ++) {
                    let ball = +req.body[positions[j].position][i];
                    if(+req.body.count == 1) ball = +req.body[positions[j].position];
                    ballsArr.push([0, positions[j].position, ball]);
                }
                criterion.balls = ballsArr;
                criterions.push(criterion);
            }

            Promise.all(criterions.map(DBi.insertCriterion)).then(result => {
                console.log("Критерии ПЭД успешно добавлены");
                //записываем логи
                writeLogs(req.session.login, req.session.position, "добавил(а) ПЭД " + req.body.name);
                console.log("Сохранен объект kpi");
                res.redirect('/change-kpi/add-kpi?action=ok');
            }).catch(err => {
                writeErrorLogs(req.session.login, err);
                console.log("Скорее всего такой ПЭД уже есть");
                res.redirect('/change-kpi/add-kpi?action=err');
            });
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.redirect('/change-kpi/add-kpi?action=err');
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на удаление одного ПЭД
exports.deleteKpi = function(req, res) {
    DBd.deleteKpi(req.body.name).then(result => {
        if(result.affectedRows > 0) {
            console.log("Удален объект kpi ", req.body.name);
            //записываем логи
            writeLogs(req.session.login, req.session.position, "удалил(а) ПЭД " + req.body.name);
            res.redirect('/change-kpi/delete-kpi?action=ok');
        }
        else {
            console.log("Такого ПЭД нет: " + req.body.name);
            res.redirect('/change-kpi/delete-kpi?action=err');
        }
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.redirect('/change-kpi/delete-kpi?action=err');
    });
};

//POST-запрос на изменение оценок одного ПЭД
exports.editBallsKpi = function(req, res) {
    let idArr = req.body.id;
    let arrBalls = [];
    let countCrit = +req.body.countcrit;
    DBs.selectPositions().then(positions => {
        for(let i = 0; i < countCrit; i++) {
            for(let j = 0; j < positions.length; j++) {
                let ball = +req.body[positions[j].position][i];
                let id = idArr[i];
                if(countCrit == 1) {
                    ball = +req.body[positions[j].position];
                    id = +idArr;
                }
                arrBalls.push([id, positions[j].position, ball]);
            }
        }
        Promise.all(arrBalls.map(DBu.updateBallOfCriterion)).then(result => {
            console.log("Оценки успешно изменены", req.body.name);
            //записываем логи
            writeLogs(req.session.login, req.session.position, "изменил(а) оценки ПЭД " + req.body.name);
            res.redirect('/change-kpi/edit-balls?action=ok');
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.redirect('/change-kpi/edit-balls?action=err');
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.redirect('/change-kpi/edit-balls?action=err');
    });
};