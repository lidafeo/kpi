const bcrypt = require("bcrypt");

let DB = require('../modules/db');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcStructure = require('../modules/func-structure');

//GET-запрос страницы для добавления сотрудника
exports.pageAddUser = function(req, res) {
    getRolesAndPositionsAndStructure().then(info => {
        let facultyArr = funcStructure.getFaculty(info.structure);
        let departmentArr = funcStructure.getDepartment(facultyArr[0], info.structure);

        res.render('change-users/page-add-user', {roles: info.roles, positions: info.positions, faculty: facultyArr,
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
        DB.users.insertUserFromObj(newUser).then(result => {
            //запись логов
            writeLogs(req.session.login, req.session.position, "добавил(а) нового пользователя: login - " + newUser.login);
            console.log("Сохранен объект user");
            res.json({result: 'Пользователь успешно добавлен'});
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.json({err: 'Не удалось добавить пользователя'});
        });
    }).then(function() {
        console.log("Пароль успешно хеширован");
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на удаление пользователя
exports.deleteUser = function(req, res) {
    let login = req.body.login;
    console.log(req.body);
    DB.users.deleteUser(login).then(result => {
        if(result.affectedRows > 0) {
            console.log("Удален пользователь: ", login);
            //записываем логи
            writeLogs(req.session.login, req.session.position, "удалил(а) пользователя " + login);
            res.json({result: 'Пользователь успешно удален'});
        }
        else {
            console.log("Нет такого пользователя: " + login);
            res.json({err: 'Не удалось удалить пользователя'});
        }
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: 'Не удалось удалить пользователя'});
    });
};

async function getRolesAndPositionsAndStructure() {
    let roles = await DB.roles.selectAllRole();
    let structure = await DB.structure.selectStructure();
    let positions = await DB.positions.selectPositions();
    return {'roles': roles, 'structure': structure, 'positions': positions};
}