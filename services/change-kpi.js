let DB = require('../modules/db');

let funcKpi = require('../modules/func-kpi');
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//запрос страницы добавления одного ПЭД
exports.pageAddKpi = async function(user) {
    let section = await DB.kpi.selectAllSection();
    let positions = await DB.positions.selectPositions();
    return {section: section, positions: positions, infoUser: user,
        pageName: '/change-kpi/'};
};

//запрос страницы выбора ПЭД для изменения
exports.pageChoiceKpi = async function(user) {
    let kpi = await DB.kpi.selectAllKpi();
    return {kpi: kpi, infoUser: user, pageName: '/change-kpi/'};
};

//запрос страницы изменения ПЭД
exports.pageEditKpi = async function(user, kpi) {
    let info = await funcKpi.getInfoOneKpi(kpi);
    console.log(info);
    return {info: info, infoUser: user, pageName: '/change-kpi/'};
};

//запрос на добавление одного ПЭД
exports.addKpi = async function(user, kpi) {
    let indicatorSum, subtype = kpi.subtype;
    if(kpi.indicatorssumm == 'true') indicatorSum = 1;
    else indicatorSum = 0;
    if(kpi.subtype == '-') subtype = null;

    let positions = await DB.positions.selectPositions();
    let newKpi = {"name": kpi.name, "section": kpi.section, "subtype": subtype,
        "number": +kpi.number, "count_criterion": +kpi.count, "description": kpi.desc,
        "type": +kpi.type, "indicator_sum": indicatorSum, "action_time": +kpi.implementationPeriod};
    let result = await DB.kpi.insertKpi(newKpi);
    console.log("Добавлен ПЭД", kpi.name);
    //теперь добавляем критерри ПЭД в БД
    let criterions = [];

    let typeCriterion, n, a, b, nameCriterion, description, startVal, finalVal;
    if(+kpi.count == 1) {
        typeCriterion = kpi.typecrit;
        n = +kpi.n;
        a = +kpi.a;
        b = +kpi.b;
        nameCriterion = kpi.namecriterion;
        description = kpi.description;
        if(!nameCriterion) nameCriterion = kpi.typecrit;
    }

    //собираем массив объектов с информацией о критериях
    for(let i = 0; i < +kpi.count; i++) {
        let marksArr = [];
        let criterion = {};

        if(+kpi.count != 1) {
            typeCriterion = kpi.typecrit[i];
            n = +kpi.n[i];
            a = +kpi.a[i];
            b = +kpi.b[i];
            nameCriterion = kpi.namecriterion[i];
            description = kpi.description[i];
            if(!nameCriterion) nameCriterion = kpi.typecrit[i];
        }
        if(kpi.type == '1')
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
        criterion.name_kpi =  kpi.name;
        criterion.name_criterion = nameCriterion;
        criterion.number_criterion = i;
        criterion.description = description;
        criterion.start_val = startVal;
        criterion.final_val = finalVal;
        console.log(kpi);
        for(let j = 0; j < positions.length; j ++) {
            let mark = +kpi[positions[j].position][i];
            if(+kpi.count == 1) mark = +kpi[positions[j].position];
            marksArr.push([0, positions[j].position, mark]);
        }
        criterion.marks = marksArr;
        criterions.push(criterion);
    }

    result = await Promise.all(criterions.map(DB.criterions.insertCriterion));
    console.log("Критерии ПЭД успешно добавлены");
    //записываем логи
    writeLogs(user.login, user.position, "добавил(а) ПЭД " + kpi.name);
    console.log("Сохранен объект kpi");
    return {result: 'Показатель эффективности деятельности ' + kpi.name + ' успешно добавлен'};
};

//запрос на удаление одного ПЭД
exports.deleteKpi = async function(user, kpi) {
    let result = await DB.kpi.deleteKpi(kpi);
    if(result.affectedRows > 0) {
        console.log("Удален объект kpi ", kpi);
        //записываем логи
        writeLogs(user.login, user.position, "удалил(а) ПЭД " + kpi);
        return {result: 'Показатель эффективности деятельности ' + kpi + ' успешно удален'};
    }
    console.log("Такого ПЭД нет: " + kpi);
    return {err: 'Не удалось удалить Показатель эффективности деятельности ' + kpi +
            ': такого ПЭД нет'};
};

//запрос на изменение одного ПЭД
exports.editKpi = async function(user, kpi) {
    let idCriterions = kpi.id;
    let criterionDescriptions = kpi.criterion_description;
    let nameCriterions = kpi.name_criterion;
    let startVals = kpi.start_val;
    let finalVals = kpi.final_val;
    let countCrit = +kpi.count_criterion;

    if(countCrit == 1) {
        idCriterions = [idCriterions];
        nameCriterions = [nameCriterions];
        startVals = [startVals];
        finalVals = [finalVals];
    }

    let arrMarks = [];
    let arrCriterion = [];
    let positions = await DB.positions.selectPositions();
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
            let mark = +kpi[positions[j].position][i];
            let id = idCriterions[i];
            if(countCrit == 1) {
                mark = +kpi[positions[j].position];
            }
            arrMarks.push([id, positions[j].position, mark]);
        }
    }
    let resultUpdateCriterion = await Promise.all(arrCriterion.map(DB.criterions.updateCriterion));
    let resultUpdateMarks = await Promise.all(arrMarks.map(DB.marks.updateMarkOfCriterion));
    console.log("Оценки успешно изменены", kpi.name);
    //записываем логи
    writeLogs(user.login, user.position, "изменил(а) оценки ПЭД " + kpi.name);
    return {result: 'Показатель эффективности деятельности ' + kpi.name + ' успешно изменен'};
};