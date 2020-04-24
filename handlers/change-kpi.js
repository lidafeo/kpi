let DB = require('../modules/db');

let funcKpi = require('../modules/func-kpi');
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//GET-запрос страницы добавления одного ПЭД
exports.pageAddKpi = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    DB.kpi.selectAllSection().then(section => {
        DB.positions.selectPositions().then(positions => {
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

//GET-запрос страницы выбора ПЭД для изменения
exports.pageChoiceKpi = function(req, res) {
    DB.kpi.selectAllKpi().then(kpi => {
        res.render('change-kpi/page-choice-kpi', {kpi: kpi,
            infoUser: req.session, pageName: '/change-kpi/choice-kpi'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы изменения ПЭД
exports.pageEditKpi = function(req, res) {
    let kpi = req.query.name;
    console.log(kpi);
    funcKpi.getInfoOneKpi(kpi).then(info => {
        console.log(info);
        res.render('change-kpi/page-edit-kpi', {info: info,
            infoUser: req.session, pageName: '/change-kpi/edit-kpi'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление одного ПЭД
exports.addKpi = function(req, res) {
    let indicatorSum, subtype = req.body.subtype;
    if(req.body.indicatorssumm == 'true') indicatorSum = 1;
    else indicatorSum = 0;
    if(req.body.subtype == '-') subtype = null;

    DB.positions.selectPositions().then(positions => {
        //insertKpi (name, section, subtype, number, count_criterion, description, type, indicator_sum, action_time)
        DB.kpi.insertKpi(req.body.name, req.body.section, subtype, +req.body.number, +req.body.count,
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

            Promise.all(criterions.map(DB.criterions.insertCriterion)).then(result => {
                console.log("Критерии ПЭД успешно добавлены");
                //записываем логи
                writeLogs(req.session.login, req.session.position, "добавил(а) ПЭД " + req.body.name);
                console.log("Сохранен объект kpi");
                res.json({result: 'Показатель эффективности деятельности ' + req.body.name + ' успешно добавлен'});
            }).catch(err => {
                writeErrorLogs(req.session.login, err);
                console.log("Скорее всего такой ПЭД уже есть");
                res.json({err: 'Не удалось добавить Показатель эффективности деятельности ' + req.body.name});
            });
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.json({err: 'Не удалось добавить Показатель эффективности деятельности ' + req.body.name});
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на удаление одного ПЭД
exports.deleteKpi = function(req, res) {
    DB.kpi.deleteKpi(req.body.name).then(result => {
        if(result.affectedRows > 0) {
            console.log("Удален объект kpi ", req.body.name);
            //записываем логи
            writeLogs(req.session.login, req.session.position, "удалил(а) ПЭД " + req.body.name);
            res.json({result: 'Показатель эффективности деятельности ' + req.body.name + ' успешно удален'});
        }
        else {
            console.log("Такого ПЭД нет: " + req.body.name);
            res.json({err: 'Не удалось удалить Показатель эффективности деятельности ' + req.body.name +
            ': такого ПЭД нет'});
        }
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: 'Не удалось удалить Показатель эффективности деятельности ' + req.body.name});
    });
};

//POST-запрос на изменение одного ПЭД
exports.editKpi = function(req, res) {
    console.log(req.body);
    let idCriterions = req.body.id;
    let criterionDescriptions = req.body.criterion_description;
    let nameCriterions = req.body.name_criterion;
    let startVals = req.body.start_val;
    let finalVals = req.body.final_val;
    let countCrit = +req.body.count_criterion;

    if(countCrit == 1) {
        idCriterions = [idCriterions];
        nameCriterions = [nameCriterions];
        startVals = [startVals];
        finalVals = [finalVals];
    }

    let arrBalls = [];
    let arrCriterion = [];
    DB.positions.selectPositions().then(positions => {
        for(let i = 0; i < countCrit; i++) {
            let finalVal = +finalVals[i];
            if(!finalVal) {
                finalVal = null;
            }
            let criterion = {id: idCriterions[i], name_criterion: nameCriterions[i],
                start_val: startVals[i], final_val: finalVal};
            criterion.criterion_description = null;
            if(criterionDescriptions) {
                criterion.criterion_description = criterionDescriptions[i];
            }
            arrCriterion.push(criterion);
            for(let j = 0; j < positions.length; j++) {
                let ball = +req.body[positions[j].position][i];
                let id = idCriterions[i];
                if(countCrit == 1) {
                    ball = +req.body[positions[j].position];
                    //id = +idCriterions;
                }
                arrBalls.push([id, positions[j].position, ball]);
            }
        }
        Promise.all(arrCriterion.map(DB.criterions.updateCriterion)).then(result => {
            Promise.all(arrBalls.map(DB.balls.updateBallOfCriterion)).then(result => {
                console.log("Оценки успешно изменены", req.body.name);
                //записываем логи
                writeLogs(req.session.login, req.session.position, "изменил(а) оценки ПЭД " + req.body.name);
                res.json({result: 'Показатель эффективности деятельности ' + req.body.name + ' успешно изменен'});
            }).catch(err => {
                writeErrorLogs(req.session.login, err);
                console.log(err);
                res.json({err: 'Не удалось изменить Показатель эффективности деятельности ' + req.body.name});
            });
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.json({err: 'Не удалось изменить Показатель эффективности деятельности ' + req.body.name});
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: 'Не удалось изменить Показатель эффективности деятельности ' + req.body.name});
    });
};