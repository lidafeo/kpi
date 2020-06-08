const fs = require("fs");

let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let getPeriod = require('../modules/period.js').getPeriod;
let createArrayOfKeyValues = require('../modules/additional').createArrayOfKeyValues;
let funcKpi = require('../modules/func-kpi');
let dateModule = require('../modules/date.js');
let funcValueOfKpi = require('../modules/func-value-of-kpi');
let generateFileName = require('../modules/additional').generateFileName;

//запрос получения оценок пользователя
exports.pageGetScores = async function(user) {
    let period = await getPeriod();
    //ищем опубликованные значения ПЭДов в заданный период
    let result = await DB.userValues.selectValueKpiUserInPeriod(user.login, dateModule.dateForInput(period.d1), dateModule.dateForInput(period.d2));
    if (result.length == 0) {
        return {kpi: null, date1: period.date1, date2: period.date2, objPeriod: period};
    }
    let criterions = await DB.criterions.selectAllCriterion(user.position);
    let arrCriterion = [];
    let kpi = [];
    for (let i = 0; i < criterions.length; i++) {
        if (kpi.indexOf(criterions[i].name_kpi) == -1) {
            arrCriterion.push({nameKpi: criterions[i].name_kpi, criterion: []});
            kpi.push(criterions[i].name_kpi);
        }
        arrCriterion[kpi.indexOf(criterions[i].name_kpi)].criterion.push({nameCriterion: criterions[i].name_criterion,
            startVal: criterions[i].start_val, finalVal: criterions[i].final_val,
            mark: criterions[i].mark, description: criterions[i].criterion_description
        });
    }
    kpi = createArrayOfKeyValues(arrCriterion, 'nameKpi');
    //Формирование массива названий ПЭДов
    let userValues = result;
    let arrKpi = [];
    let info = {};
    let nameKpi = userValues[0].name_kpi;
    let section = [];
    //добавление к свойствам ПЭДов оценок пользователя
    for (let i = 0; i <= userValues.length; i++) {
        if (i == userValues.length || nameKpi != userValues[i].name_kpi) {
            //сортировка по разделам деятельности
            if (section.indexOf(userValues[i - 1].section) == -1) {
                section.push(userValues[i - 1].section);
                arrKpi.push([]);
            }
            arrKpi[section.indexOf(userValues[i - 1].section)].push(info);
            info = {};
        }
        if (i != userValues.length) {
            nameKpi = userValues[i].name_kpi;
            //добавление информации к ПЭДам
            funcKpi.sortKpi(userValues[i], info, arrCriterion[kpi.indexOf(nameKpi)].criterion);
            info.userMark = funcValueOfKpi.calculateMark(info, arrCriterion[kpi.indexOf(nameKpi)].criterion);
        }
    }
    //устанавливаем правильный порядок вывода ПЭДов
    for (let i = 0; i < arrKpi.length; i++)
        arrKpi[i].sort(funcKpi.sortArr);
    return {kpi: arrKpi, date1: dateModule.dateForOut(period.d1), date2:  dateModule.dateForOut(period.d2), objPeriod: period};
};

//запрос страницы добавления значений ПЭД
exports.pageAddValueKpi = async function (user) {
    let result = await DB.kpi.selectAllKpi();
    let obj = {};
    for(let i = 0; i < result.length; i++) {
        if(!obj[result[i].section])
            obj[result[i].section] = {};
        if(result[i].subtype) {
            if(!obj[result[i].section][result[i].subtype])
                obj[result[i].section][result[i].subtype] = [];
            obj[result[i].section][result[i].subtype].push({name: result[i].name,
                description: result[i].description});
        }
        else {
            if(!obj[result[i].section]['nosubtype'])
                obj[result[i].section]['nosubtype'] = [];
            obj[result[i].section]['nosubtype'].push({name: result[i].name,
                description: result[i].description});
        }
    }
    for(sect in obj) {
        for(subt in obj[sect]) {
            obj[sect][subt].sort(function(a, b) {
                return (+a['name'].match(/\d/g).join('') > +b['name'].match(/\d/g).join('')) ? 1 : -1;
            });
        }
    }
    return {obj: obj, infoUser: user, pageName: '/pps/add-value-kpi'};
};

//запрос страницы просмотра добавленных значений ПЭД
exports.pageGetValuesKpi = async function(user) {
    let period = await getPeriod();
    console.log(period);
    period.dateStart = dateModule.dateForOut(period.d1);
    period.dateFinish = dateModule.dateForOut(period.d2);
    let result = await DB.userValues.selectAllValueKpiUserInPeriodOrderByDate(user.login, period.date1, period.date2);
    funcValueOfKpi.modifyDateOfValue(result);
    return {kpi: result, period: period};
};

//Получение значения ПЭД
exports.pageGetValue = async function(user, valId) {
    let result = await DB.userValues.selectValueKpiById(valId, user.login);
    funcValueOfKpi.modifyDateOfValue(result);
    return {val: result[0], infoUser: user, pageName: '/pps/val'};
};

//запрос уже добавленных значений ПЭД
exports.chooseKpiForAddValue = async function(user, nameKpi) {
    let kpi = await DB.marks.selectMarkOneKpi(nameKpi, user.position);
    if(kpi[0].mark != 0) {
        let result = await DB.userValues.selectValueKpiOfUserOneKpi(user.login, nameKpi);
        funcValueOfKpi.modifyDateOfValue(result);
        return {kpi: result, desc: kpi, textErr: false};
    }
    return {kpi: [], textErr: true};
};

//запрос на добавление значения одного ПЭД
exports.addValueKpi = async function(user, fields, files) {
    let resultCheck = checkInput(fields, files);
    if(resultCheck !== true) {
        return resultCheck;
    }
    let fileName = "";
    let criterion = 0;
    if(fields.criterion) criterion = fields.criterion;
    //находим в БД добавляемый ПЭД, чтобы узнать время его действия
    let result = await DB.kpi.selectOneKpi(fields.name);
    let kpi = result[0];
    let finishDate = new Date(fields.date);
    if(files.file) {
        let ext = files.file.name.split('.').pop();
        fileName = generateFileName(user.login) + '.' + ext;
    }
    finishDate.setMonth(finishDate.getMonth() + kpi.action_time);
    let val = {"login": user.login, "name_kpi": kpi.name, "value": +fields.value, "date": dateModule.dateForInput(new Date()),
        "start_date": dateModule.dateForInput(new Date(fields.date)), "finish_date": dateModule.dateForInput(finishDate),
        "text": fields.text, "link": fields.link, "file": fileName, "number_criterion": criterion};
    result = await DB.userValues.insertValueKpi(val);
    console.log("Сохранен объект uservalue");
    //записываем логи
    writeLogs(user.login, user.position, "добавил(а) новое значение ПЭД " + kpi.name + " равное " + fields.value);
    let id = result.insertId;
    //сохраняем прикрепленный файл
    if(files.file) {
        let readableStream = fs.createReadStream(files.file.path);
        let writeableStream = fs.createWriteStream("./user_files/" + fileName);
        readableStream.pipe(writeableStream);
    }
    return {'result': 'ok'};
};

//запрос на изменение полей значения
exports.changeFieldVal = async function(user, fields, files) {
    let id = fields.id;
    let val = fields;
    if (files.file) {
        let ext = files.file.name.split('.').pop();
        let fileName = generateFileName(user.login) + '.' + ext;
        //сохраняем  файл
        if (files.file) {
            let readableStream = fs.createReadStream(files.file.path);
            let writeableStream = fs.createWriteStream("./user_files/" + fileName);
            readableStream.pipe(writeableStream);
        }
        val.file = fileName;
    }
    let nameField, valueField;
    for (key in val) {
        if(key !== 'id') {
            nameField = key;
            valueField = val[key];
        }
    }
    let result = await DB.userValues.updateFieldValue(id, nameField, valueField);
    //записываем логи
    writeLogs(user.login, user.position, "изменил(а) поле " + nameField + " на " + valueField + " значения с id=" + id);
    if (result.affectedRows > 0) {
        return {name: nameField, value: valueField};
    }
    return {err: "Не удалось", name: nameField};
};

//запрос на удаление значения
exports.deleteVal = async function(user, id) {
    let result = await DB.userValues.deleteVal(id, user.login);
    //записываем логи
    writeLogs(user.login, user.position, "удалил(а) значение с id=" + id);
    if (result.affectedRows > 0) {
        return {result: "Значение успешно удалено"};
    }
    return {err: "Не удалось удалить значение"};
};

function checkInput(fields, files) {
    if(!files.file && fields.text == "")
        return {'err': 'Необходимо прикрепить файл или написать пояснительную записку'};
    if(+fields.value <= 0)
        return {'err': 'Необходимо указать значение'};
    if(!fields.date || new Date(fields.date) > new Date())
        return {'err': 'Необходимо указать дату реализации'};
    if(new Date(fields.date) >= new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate() + 1))
        return {'err': 'Дата реализации не должна быть позже сегодняшней даты'};
    if(fields.criterion && +fields.criterion < 0)
        return {'err': 'Неверное значение критерия'};
    if(fields.criterion && +fields.criterion < 0)
        return {'err': 'Неверное значение критерия'};
    if(files.file && files.file.size > 1048576)
        return {'err': 'Слишком большой файл'};
    return true;
}