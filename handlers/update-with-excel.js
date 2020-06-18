const fs = require("fs");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const xlsx = require("xlsx");

let DB = require('../modules/db');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let userFunc = require('../modules/func-user');
let pastKpiFunc = require('../modules/past-kpi');

let updateWithExcelService = require('../services/update-with-excel');
//GET-запрос страницы добавления сотрудников с файла
exports.pageAddUsersFromFile1 = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-add-users-from-file1', {infoUser: req.session,
        pageName: '/update-db/'});
};

//GET-запрос страницы добавления сотрудников с файла №2
exports.pageAddUsersFromFile2 = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-add-users-from-file2', {infoUser: req.session,
        pageName: '/update-db/'});
};

//GET-запрос страницы добавления прошлых значений ПЭД с файла
exports.pageAddPastKpi = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-add-past-values', {infoUser: req.session,
        pageName: '/update-db/'});
};

//GET-запрос страницы обновления таблицы структуры университета
exports.pageUpdateStructure = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-update-structure', {infoUser: req.session,
        pageName: '/update-db/'});
};

//POST-запрос на добавление пользователей с файла вариант 1
exports.addUsersFromFile1 = function(req, res) {
    let user = req.session;
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            writeErrorLogs(req.session.login, err);
            return res.status(500).json({err: "Произошла внутренняя ошибка!"});
        }
        let arr = ['xls', 'xlsx'];
        if (!files.file) {
            return res.join({err: "Прикрепите файл"});
        }
        let ext = files.file.name.split('.').pop();
        if (arr.indexOf(ext) == -1) {
            return res.json({err: "Необходимо прикрепить файл с расширением xls или xlsx"});
        }
        updateWithExcelService.addUsersFromFile1(user, files).then(result => {
            return res.json(result);
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            return res.status(500).json({err: "Произошла внутренняя ошибка!"});
        });
    });
};

//POST-запрос на добавление пользователей (ППС) с файла вариант 2
exports.addUsersFromFile2 = function(req, res) {
    let form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {
            if (err) return console.log(err);

            let arr = ['xls', 'xlsx'];
            let ext = files.file.name.split('.').pop();
            if (!files.file) {
                return res.join({err: "Прикрепите файл"});
            }
            if (arr.indexOf(ext) == -1) {
                return res.json({err: "Необходимо прикрепить файл с расширением xls или xlsx"});
            }

            let workBook = xlsx.readFile(files.file.path);
            let firstSheetName = workBook.SheetNames[0];
            let workSheet = workBook.Sheets[firstSheetName];

            //удаляем, если нужно
            let promise = new Promise( (resolve, reject) => {
                if (fields['option'] == 'on') {
                    DB.users.deleteAllPps().then(result => {
                        //записываем логи
                        writeLogs(req.session.login, req.session.position, "удалил(а) всех пользователей - ППС");
                        resolve('ok');
                    });
                } else {
                    resolve('ok');
                }
            });
            promise.then(result => {
                userFunc.main(workSheet).then(users => {
                    //добавляем
                    Promise.all(users.addUsers.map(async function (user) {
                        user.passwordWithoutHash = user.password;
                        user.password = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
                        let result = await DB.users.insertUserFromObj(user);
                        //записываем логи
                        writeLogs(req.session.login, req.session.position, "добавил(а) нового пользователя: login - " + user.login);
                        console.log("Сохранен объект user", user.login);
                    })).then(result => {
                        res.render("update-db/partials/report-add-users", {
                            users: users.allUsers,
                            countAdd: users.addUsers.length, counts: users.counts,
                            infoUser: req.session, pageName: '/update-db/add-users-from-file2'
                        });
                    });
                });
            });
        });
    } catch (err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    }
};

//POST-запрос на обновление структуры университета
exports.updateStructure = function(req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) return console.log(err);

        let arr = ['xls', 'xlsx'];
        let ext = files.file.name.split('.').pop();
        if (!files.file) {
            return res.join({err: "Прикрепите файл"});
        }
        if (arr.indexOf(ext) == -1) {
            return res.json({err: "Необходимо прикрепить файл с расширением xls или xlsx"});
        }

        let workBook = xlsx.readFile(files.file.path);
        let firstSheetName = workBook.SheetNames[0];
        let workSheet = workBook.Sheets[firstSheetName];

        let num = 1;
        let arrStruct = [];
        while(true) {
            let obj = {};
            //факультет
            let faculty = (workSheet["A" + (num + 1)] ? (workSheet["A" + (num + 1)].v + "") : undefined);
            if(!faculty) break;
            obj.faculty = faculty;
            obj.abbr_faculty = "";
            if(faculty.includes('(') && faculty.includes(')')) {
                obj.abbr_faculty = faculty.slice(faculty.indexOf('(') + 1, faculty.indexOf(')'));
            }
            //кафедра
            let department = (workSheet["B" + (num + 1)] ? (workSheet["B" + (num + 1)].v + "") : undefined);
            if(!department) {
                res.json({err: "Не установлена кафедра в ячейке B" + (num + 1)});
            }
            obj.department = department;
            obj.abbr_department = "";
            if(department.includes('(') && department.includes(')')) {
                obj.abbr_department = department.slice(department.indexOf('(') + 1, department.indexOf(')'));
            }

            arrStruct.push(obj);
            num++;
        }
        //чистим таблицу
        DB.structure.deleteStructure().then(function(result) {
            //добавляем
            Promise.all(arrStruct.map(function (object) {
                let result = DB.structure.insertDepartment(object);
                //записываем логи
                writeLogs(req.session.login, req.session.position, "добавил(а) кафедру " + object.department + " факультета " + object.faculty);
                console.log("Сохранен объект structure", "кафедра: " + object.department + " факультет: " + object.faculty);
            })).then(result => {
                DB.structure.selectStructureOrderByFaculty().then(result => {
                    let fac = [];
                    let dep = [];
                    for(let i = 0; i < result.length; i++) {
                        if(fac.indexOf(result[i].faculty) == -1) {
                            fac.push(result[i].faculty);
                            dep.push([]);
                        }
                        dep[fac.indexOf(result[i].faculty)].push(result[i].department);
                    }
                    fs.writeFile("./public/structure.json", JSON.stringify({faculty: fac, department: dep}), err => {
                        console.log(err);
                    });
                    res.json({result: 'Структура университета успешно обновлена'});
                }).catch(err => {
                    writeErrorLogs(req.session.login, err);
                    console.log(err);
                });
            }).catch(err => {
                writeErrorLogs(req.session.login, err);
                res.json({err: 'Произошла внутренняя ошибка!'});
            });
        });
    });
};

//POST-запрос на добавление прошлых значений ПЭД ППС с файла
exports.addPastKpi = function(req, res) {
    let form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {
            if (err) return console.log(err);

            let arr = ['xls', 'xlsx', 'csv'];
            let ext = files.file.name.split('.').pop();
            if (!files.file) {
                return res.join({err: "Прикрепите файл"});
            }
            if (arr.indexOf(ext) == -1) {
                return res.json({err: "Необходимо прикрепить файл с расширением xls, xlsx или csv"});
            }

            let workBook = xlsx.readFile(files.file.path);
            let firstSheetName = workBook.SheetNames[0];
            let workSheet = workBook.Sheets[firstSheetName];

            //удаляем, если нужно
            let promise = new Promise((resolve, reject) => {
                if (fields['option'] == 'on') {
                    DB.userValues.deleteAllUserValues().then(result => {
                        //записываем логи
                        writeLogs(req.session.login, req.session.position, "удалил(а) все значения ПЭД пользователей");
                        resolve('ok');
                    });
                } else {
                    resolve('ok');
                }
            });
            promise.then(result => {
                pastKpiFunc.main(workSheet).then(users => {
                    return res.render('update-db/partials/report-add-past-values', {
                        countAdd: 0, countError: users.counts.countError, users: users.allUsers
                    });
                });
            });
        });
    } catch (err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    }
};