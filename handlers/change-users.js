const bcrypt = require("bcrypt");

//функции работы с БД
let DBs = require('../modules/db/select.js');
let DBi = require('../modules/db/insert.js');
let DBd = require('../modules/db/delete.js');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcStructure = require('../modules/func-structure');

//GET-запрос страницы для добавления сотрудника
exports.pageAddUser = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    getRolesAndPositionsAndStructure().then(info => {
        let facultyArr = funcStructure.getFaculty(info.structure);
        let departmentArr = funcStructure.getDepartment(facultyArr[0], info.structure);

        res.render('change-users/page-add-user', {roles: info.roles, positions: info.positions, action: action, faculty: facultyArr,
            department: departmentArr, infoUser: req.session, pageName: '/change-users/add-user'});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление пользователя
exports.addUser = function(req, res) {
    console.log("Добавление пользователя");
    console.log(req.body);
    let newUser = req.body;
    if(!newUser.faculty)
        newUser.faculty = null;
    if(!+newUser.numdepartment)
        newUser.department = null;

    bcrypt.hash(newUser.password, BCRYPT_SALT_ROUNDS).then(function(hashedPassword) {
        newUser.password = hashedPassword;
        //insertUser(name, role, faculty, department, login, password)
        DBi.insertUserFromObj(newUser).then(result => {
            //запись логов
            writeLogs(req.session.login, req.session.position, "добавил(а) нового пользователя: login - " + newUser.login);
            console.log("Сохранен объект user");
            res.redirect('/change-users/add-user?action=ok');
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.redirect('/change-users/add-user?action=err');
        });
    }).then(function() {
        console.log("Пароль успешно хеширован");
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log("Error saving user: ");
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы удаления сотрудника
exports.pageDeleteUser = function(req, res) {
    let action = 0;
    if(req.query.action == 'ok') action = 1;
    if(req.query.action == 'err') action = 2;
    DBs.selectAllUsers().then(users => {
        res.render('change-users/page-delete-user', {users: users, action: action,
            infoUser: req.session, pageName: '/change-users/delete-user'});
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на удаление пользователя
exports.deleteUser = function(req, res) {
    let login = req.body.user;
    DBd.deleteUser(login).then(result => {
        if(result.affectedRows > 0) {
            console.log("Удален пользователь: ", login);
            //записываем логи
            writeLogs(req.session.login, req.session.position, "удалил(а) пользователя " + login);
            res.redirect('/change-users/delete-user?action=ok');
        }
        else {
            console.log("Нет такого пользователя: " + login);
            res.redirect('/change-users/delete-user?action=err');
        }
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.redirect('/change-users/delete-user?action=err');
    });
};

async function getRolesAndPositionsAndStructure() {
    let roles = await DBs.selectAllRole();
    let structure = await DBs.selectStructure();
    let positions = await DBs.selectPositions();
    return {'roles': roles, 'structure': structure, 'positions': positions};
}