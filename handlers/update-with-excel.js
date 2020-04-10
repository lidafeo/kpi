const fs = require("fs");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const xlsx = require("xlsx");

//функции работы с БД
let DBs = require('../modules/db/select.js');
let DBi = require('../modules/db/insert.js');
let DBd = require('../modules/db/delete.js');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let userFunc = require('../modules/func-user');
let pastKpiFunc = require('../modules/past-kpi');

//GET-запрос страницы добавления сотрудников с файла
exports.pageAddUsersFromFile1 = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-add-users-from-file1', {action: action,
        infoUser: req.session, pageName: '/update-db/add-users-from-file1'});
};

//GET-запрос страницы добавления сотрудников с файла №2
exports.pageAddUsersFromFile2 = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-add-users-from-file2', {action: action, report: false,
        infoUser: req.session, pageName: '/update-db/add-users-from-file2'});
};

//GET-запрос страницы добавления прошлых значений ПЭД с файла
exports.pageAddPastKpi = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-add-past-values', {action: action, report: false,
        infoUser: req.session, pageName: '/update-db/past-kpi'});
};

//GET-запрос страницы обновления таблицы структуры университета
exports.pageUpdateStructure = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    res.render('update-db/page-update-structure', {action: action,
        infoUser: req.session, pageName: '/update-db/update-structure'});
};

//POST-запрос на добавление пользователей с файла вариант 1
exports.addUsersFromFile1 = function(req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) return console.log(err);

        let arr = ['xls', 'xlsx'];
        let ext = files.file.name.split('.').pop();
        if(!files.file || arr.indexOf(ext) == -1)
            return res.redirect('/update-db/add-users-from-file1?action=err');

        let workBook = xlsx.readFile(files.file.path);
        let firstSheetName = workBook.SheetNames[0];
        let workSheet = workBook.Sheets[firstSheetName];

        let address = {"B" : "faculty", "C" : "department", "D" : "role", "E" : "login",
            "F" : "password"};
        let num = 0;
        let arrUsers = [];
        let arrNames = [];
        let arrLogin = [];
        while(true) {
            let obj = {};
            let name = (workSheet["A" + (num + 1)] ? (workSheet["A" + (num + 1)].v + "") : undefined);
            if(!name) break;
            obj.name = name;
            for(let key in address) {
                let addr = key + (num + 1);
                obj[address[key]] = (workSheet[addr] ? (workSheet[addr].v + "") : undefined);
            }

            if(obj.role && obj.login && obj.password) {
                arrUsers.push(obj);
                arrNames.push(obj.name);
                arrLogin.push(obj.login);
            }
            num++;
        }
        //добавляем
        Promise.all(arrUsers.map(async function (user) {
            user.password = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
            let result = await DBi.insertUserFromObj(user);
            //записываем логи
            writeLogs(req.session.login, req.session.position, "добавил(а) нового пользователя: login - " + user.login);
            console.log("Сохранен объект user", user.login);
        })).then(result => {
            res.redirect('/update-db/add-users-from-file1?action=ok');
        });
    });
};

//POST-запрос на добавление пользователей (ППС) с файла вариант 2
exports.addUsersFromFile2 = function(req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) return console.log(err);

        let arr = ['xls', 'xlsx'];
        let ext = files.file.name.split('.').pop();
        if(!files.file || arr.indexOf(ext) == -1)
            return res.redirect('/update-db/add-users-from-file2?action=err');

        let workBook = xlsx.readFile(files.file.path);
        let firstSheetName = workBook.SheetNames[0];
        let workSheet = workBook.Sheets[firstSheetName];

        //удаляем, если нужно
        new Promise(async (resolve, reject) => {
            if(fields['del_pps'] == 'on') {
                await DBd.deleteAllPps();
                //записываем логи
                writeLogs(req.session.login, req.session.position, "удалил(а) всех пользователей - ППС");
            }
            resolve();
        }).then(result => {
            userFunc.main(workSheet).then(users => {
                //добавляем
                Promise.all(users.addUsers.map(async function (user) {
                    user.passwordWithoutHash = user.password;
                    user.password = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
                    let result = await DBi.insertUserFromObj(user);
                    //записываем логи
                    writeLogs(req.session.login, req.session.position, "добавил(а) нового пользователя: login - " + user.login);
                    console.log("Сохранен объект user", user.login);
                })).then(result => {
                    res.render('update-db/page-add-users-from-file2', {action: 'ok', report: true,
                        users: users.allUsers,
                        countAdd: users.addUsers.length, counts: users.counts,
                        infoUser: req.session, pageName: '/update-db/add-users-from-file2'
                    });
                });
            });
        });
    });
};

//POST-запрос на обновление структуры университета
exports.updateStructure = function(req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) return console.log(err);

        let arr = ['xls', 'xlsx'];
        let ext = files.file.name.split('.').pop();
        if(!files.file || arr.indexOf(ext) == -1)
            return res.redirect('/update-db/update-structure?action=err');

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
                res.redirect('/update-db/update-structure?action=err');
            };
            /*if (department.trim().toLowerCase().startsWith('кафедра')) {
                department = department.slice(department.toLowerCase().indexOf('кафедра') + 'кафедра'.length).trim();
            }
            if (department.includes('"') || department.includes("'")) {
                department = department.replace(/'/g, "").trim();
                department = department.replace(/"/g, "").trim();
            }*/
            obj.department = department;
            obj.abbr_department = "";
            if(department.includes('(') && department.includes(')')) {
                obj.abbr_department = department.slice(department.indexOf('(') + 1, department.indexOf(')'));
            }

            arrStruct.push(obj);
            num++;
        }
        //чистим таблицу
        DBd.deleteStructure().then(function(result) {
            //добавляем
            Promise.all(arrStruct.map(function (object) {
                let result = DBi.insertDepartment(object);
                //записываем логи
                writeLogs(req.session.login, req.session.position, "добавил(а) кафедру " + object.department + " факультета " + object.faculty);
                console.log("Сохранен объект structure", "кафедра: " + object.department + " факультет: " + object.faculty);
            })).then(result => {
                res.redirect('/update-db/update-structure?action=ok');

                DBs.selectStructureOrderByFaculty().then(result => {
                    let structure = {};
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
                }).catch(err => {
                    writeErrorLogs(res.session.login, err);
                    console.log(err);
                });
            }).catch(err => {
                writeErrorLogs(res.session.login, err);
                res.redirect('/update-db/update-structure?action=err');
            });
        });
    });
};

//POST-запрос на добавление прошлых значений ПЭД ППС с файла
exports.addPastKpi = function(req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) return console.log(err);

        let arr = ['xls', 'xlsx', 'csv'];
        let ext = files.file.name.split('.').pop();
        if(!files.file || arr.indexOf(ext) == -1)
            return res.redirect('/update-db/past-kpi?action=err');

        let workBook = xlsx.readFile(files.file.path);
        let firstSheetName = workBook.SheetNames[0];
        let workSheet = workBook.Sheets[firstSheetName];

        //удаляем, если нужно
        new Promise( (resolve, reject) => {
            if(fields['del_val'] == 'on') {
                console.log('Нужно удалить');
                DBd.deleteAllUservalues().then(result => {
                    //записываем логи
                    writeLogs(req.session.login, req.session.position, "удалил(а) все значения ПЭД пользователей");
                    resolve('ok');
                });
            } else {
                resolve('ok');
            }
            //resolve();
        }).then(result => {
            pastKpiFunc.main(workSheet).then(users => {
                //добавляем
                /*
                Promise.all(users.addUsers.map(async function (user) {
                    user.passwordHash = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
                    let result = await DBi.insertUserFromObj(user);
                    //записываем логи
                    writeLogs(req.session.login, req.session.level, "добавил(а) нового пользователя: login - " + user.login);
                    console.log("Сохранен объект user", user.login);
                })).then(result => {
                    res.render('admin/users/page_add_users_from_file2', {action: 'ok', report: true,
                    users: users.allUsers, countAdd: users.addUsers.length, counts: users.counts});
                });
                 */
                res.render('update-db/page-add-past-values', {action: 'ok', report: true,
                    countAdd: 0, countError: users.counts.countError, users: users.allUsers,
                    infoUser: req.session, pageName: '/update-db/past-kpi'});
            });
        });
    });
};