const bcrypt = require("bcrypt");

let DB = require('../modules/db');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcStructure = require('../modules/func-structure');

//GET-запрос страницы для добавления ППС
exports.pageAddPps = function(req, res) {
    getPositionsAndStructure().then(info => {
        let facultyArr = funcStructure.getFaculty(info.structure);
        let departmentArr = funcStructure.getDepartment(facultyArr[0], info.structure);

        res.render('change-pps/page-add-pps', {positions: info.positions, faculty: facultyArr,
            department: departmentArr, infoUser: req.session, pageName: '/change-pps/add-pps'});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление ППС
exports.addPps = function(req, res) {
    console.log("Добавление ППС");
    console.log(req.body);
    let newUser = req.body;
    if(!newUser.department || newUser.position == 'Декан') {
        newUser.department = null;
    }
    if(newUser.position == 'Декан' || newUser.position == 'Заведующий кафедрой') {
        newUser.role = 'Руководитель подразделения';
    } else {
        newUser.role = 'ППС';
    }

    bcrypt.hash(newUser.password, BCRYPT_SALT_ROUNDS).then(function(hashedPassword) {
        newUser.password = hashedPassword;
        DB.users.insertUserFromObj(newUser).then(result => {
            //запись логов
            writeLogs(req.session.login, req.session.position, "добавил(а) нового пользователя: login - " + newUser.login);
            console.log("Сохранен объект user");
            res.json({result: 'Пользователь ' + newUser.login + ' успешно добавлен'});
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

//GET-запрос страницы для изменения пароля ППС
exports.pageChangePassword = function(req, res) {
    let loginUser = req.query.login;
    console.log(loginUser);
    //проверка, что есть логин
    if(!loginUser)  {
        return res.status(404).render('error/404');
    }
    DB.users.selectOneUser(loginUser).then(users => {
        //проверка, что это ППС
        if(!users || users.length == 0 || !users[0].position)  {
            return res.status(404).render('error/404');
        }
        let user = users[0];
        res.render('change-pps/page-change-password', {user: user,
            infoUser: req.session, pageName: '/change-pps/change-password'});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на изменение пароля ППС
exports.changePassword = function(req, res) {
    console.log("Изменение пароля ППС");
    console.log(req.body);
    let user = req.body;
    if(!user || !user.login || !user.password || user.password.length < 3
        ||user.password.length > 50) {
        return res.json({err: 'Введите пароль от 3 до 50 символов'});
    }
    bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS).then(function(hashedPassword) {
        user.password = hashedPassword;
        DB.users.updatePassword(user.login, user.password).then(result => {
            //запись логов
            writeLogs(req.session.login, req.session.position, "изменил(а) пароль пользователю: login - " + user.login);
            res.json({result: 'Пароль пользователя успешно изменен'});
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.json({err: 'Не удалось изменить пароль пользователю'});
        });
    }).then(function() {
        console.log("Пароль успешно хеширован");
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

async function getPositionsAndStructure() {
    let structure = await DB.structure.selectStructure();
    let positions = await DB.positions.selectPositions();
    return {'structure': structure, 'positions': positions};
}