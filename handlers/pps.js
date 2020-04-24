const formidable = require("formidable");
const fs = require("fs");

let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let dateModule = require('../modules/date.js');
let generateFileName = require('../modules/additional').generateFileName;
let createArrayOfKeyValues = require('../modules/additional').createArrayOfKeyValues;
let getObjPeriod = require('../modules/period.js').getObjPeriod;

let getPeriod = require('../modules/period.js').getPeriod;

let funcKpi = require('../modules/func-kpi');
let funcValueOfKpi = require('../modules/func-value-of-kpi');

//страница получения оценок пользователя
exports.pageGetMyScore = function(req, res) {
    let name = req.session.name;
    let login = req.session.login;
    let position = req.session.position;

    getPeriod().then(period => {

        //ищем опубликованные значения ПЭДов в заданный период
        DB.userValues.selectValueKpiUserInPeriod(login, dateModule.dateForInput(period.d1), dateModule.dateForInput(period.d2)).then(result => {

            if(result.length == 0) {
                res.render("pps/page-get-scores", {name: name, position: position, kpi: null, date1:
                    period.date1, date2: period.date2, objPeriod: period, infoUser: req.session,
                    pageName: '/pps/get-my-score'});
            }
            else {
                new Promise((resolve, reject) => {
                    DB.criterions.selectAllCriterion(position).then(result => {
                        let arrObj = [];
                        let kpi = [];
                        for(let i = 0; i < result.length; i++) {
                            if(kpi.indexOf(result[i].name_kpi) == -1) {
                                arrObj.push({nameKpi: result[i].name_kpi, criterion: []});
                                kpi.push(result[i].name_kpi);
                            }
                            arrObj[kpi.indexOf(result[i].name_kpi)].criterion.push({nameCriterion: result[i].name_criterion,
                                startVal: result[i].start_val, finalVal: result[i].final_val,
                                ball: result[i].ball, description: result[i].criterion_description});
                        }
                        resolve(arrObj);
                    }).catch(err => {
                        writeErrorLogs(req.session.login, err);
                        console.log(err);
                        res.status(500).render('error/500');
                    });
                }).then(arrCriterion => {
                    let kpi = createArrayOfKeyValues(arrCriterion, 'nameKpi');
                    //Формирование массива названий ПЭДов
                    let userValues = result;
                    let arrKpi = [];

                    let info = {};
                    let nameKpi = userValues[0].name_kpi;
                    let section = [];
                    //добавление к свойствам ПЭДов оценок пользователя
                    for(let i = 0; i <= userValues.length; i ++) {
                        if(i == userValues.length || nameKpi != userValues[i].name_kpi) {
                            //сортировка по разделам деятельности
                            if(section.indexOf(userValues[i - 1].section) == -1) {
                                section.push(userValues[i - 1].section);
                                arrKpi.push([]);
                            }
                            arrKpi[section.indexOf(userValues[i - 1].section)].push(info);
                            info = {};
                        }
                        if(i != userValues.length) {
                            nameKpi = userValues[i].name_kpi;
                            //добавление информации к ПЭДам
                            funcKpi.sortKpi(userValues[i], info, arrCriterion[kpi.indexOf(nameKpi)].criterion);
                            info.userBall = funcValueOfKpi.calculateBall(info, arrCriterion[kpi.indexOf(nameKpi)].criterion);
                        }
                    }
                    //устанавливаем правильный порядок вывода ПЭДов
                    for(let i = 0; i < arrKpi.length; i++)
                        arrKpi[i].sort(funcKpi.sortArr);
                    res.render("pps/page-get-scores", {name: name, position: position, kpi: arrKpi,
                        date1: period.date1, date2: period.date2, objPeriod: period,
                        infoUser: req.session, pageName: '/pps/get-my-score'});
                });
            }
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы добавления значений ПЭД
exports.pageAddValueKpi = function(req, res) {
    DB.kpi.selectAllKpi().then(result => {
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
        res.render('pps/page-add-value', {obj: obj, infoUser: req.session,
            pageName: '/pps/add-value-kpi'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы просмотра добавленных значений ПЭД
exports.pageGetValuesKpi = function(req, res) {
    getPeriod().then(period => {
        console.log(period);
        period.dateStart = dateModule.dateForOut(period.d1);
        period.dateFinish = dateModule.dateForOut(period.d2);
        DB.userValues.selectValueKpiUserInPeriodOrderByDate(req.session.login, period.date1, period.date2).then(result => {
            funcValueOfKpi.modifyDateOfValue(result);
            res.render('pps/page-my-values', {
                kpi: result, infoUser: req.session, period: period,
                pageName: '/pps/get-values-kpi'
            });
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

//Получение значения ПЭД
exports.pageGetValue = function(req, res) {
    let valId = req.params["valId"];
    let login = req.session.login;
    DB.userValues.selectValueKpiById(valId, login).then(result => {
        //if(!result[0]) {
        //	res.render('pps/page_one_val', {val: result[0]});
        //}
        funcValueOfKpi.modifyDateOfValue(result);
        res.render('pps/page-one-value', {val: result[0], infoUser: req.session,
            pageName: '/pps/val'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос уже добавленных значений ПЭД
exports.chooseKpiForAddValue = function(req, res) {
    let position = req.session.position;
    let login = req.session.login;
    DB.balls.selectBallOneKpi(req.body.name, position).then(kpi => {
        if(kpi[0].ball != 0) {
            DB.userValues.selectValueKpiOfUserOneKpi(login, req.body.name).then(result => {
                funcValueOfKpi.modifyDateOfValue(result);
                res.render("pps/partials/table-posted-values", {kpi: result, desc: kpi, textErr: false});
            }).catch(err => {
                writeErrorLogs(req.session.login, err);
                console.log(err);
                res.status(500).render('error/500');
            });
        }
        else {
            res.render("pps/partials/table-posted-values", {kpi: [], textErr: true});
        }
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление значения одного ПЭД
exports.addValueKpi = function(req, res) {
    let login = req.session.login;
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) return console.log(err);

        let fileName = "";
        if(!files.file && fields.text == "" || +fields.value == 0 || fields.date == "")
            return res.send('err');

        let radio = 0;
        if(fields.radio) radio = fields.radio;
        //находим в БД добавляемый ПЭД, чтобы узнать время его действия
        DB.kpi.selectOneKpi(fields.name).then(result => {
            let kpi = result[0];
            let finishDate = new Date(fields.date);
            if(files.file) {
                let ext = files.file.name.split('.').pop();
                fileName = generateFileName(login) + '.' + ext;
            }
            finishDate.setMonth(finishDate.getMonth() + kpi.action_time);
            let val = {"login": login, "name_kpi": kpi.name, "value": +fields.value,
                "date": dateModule.dateForInput(new Date()),
                "start_date": dateModule.dateForInput(new Date(fields.date)),
                "finish_date": dateModule.dateForInput(finishDate), "text": fields.text,
                "link": fields.link, "file": fileName, "number_criterion": radio};
            DB.userValues.insertValueKpi(val).then(result => {
                console.log("Сохранен объект uservalue");
                res.send('ok');
                //записываем логи
                writeLogs(login, req.session.position, "добавил(а) новое значение ПЭД " + kpi.name + " равное " + fields.value);
                let id = result.insertId;
                //сохраняем прикрепленный файл
                if(files.file) {
                    let readableStream = fs.createReadStream(files.file.path);
                    let writeableStream = fs.createWriteStream("./user_files/" +
                        fileName);
                    readableStream.pipe(writeableStream);
                }
            }).catch(err => {
                writeErrorLogs(req.session.login, err);
                console.log(err);
                res.status(500).render('error/500');
            });
        });
    });
};
