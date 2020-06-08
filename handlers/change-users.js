let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let changeUserService = require('../services/change-users');

//GET-запрос страницы для добавления сотрудника
exports.pageAddUser = function(req, res) {
    let user = req.session;
    changeUserService.pageAddUser(user).then(result => {
        res.render('change-users/page-add-user', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы для изменения сотрудника
exports.pageChangeUser = function(req, res) {
    let user = req.session;
    let loginUser = req.query.login;
    changeUserService.pageChangeUser(user, loginUser).then(result => {
        res.render('change-users/page-change-user', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление пользователя
exports.addUser = function(req, res) {
    let user = req.session;
    console.log("Добавление пользователя");
    console.log(req.body);
    let newUser = req.body;
    changeUserService.addUser(user, newUser).then(result => {
        res.json(result);
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: "Ошибка сервера! Обратитесь к администратору"});
        //res.status(500).render('error/500');
    });
};

//POST-запрос на изменение пользователя
exports.changeUser = function(req, res) {
    let user = req.session;
    console.log(req.body);
    let newUser = req.body;
    let loginUser = req.body.login;
    changeUserService.changeUser(user, loginUser, newUser).then(result => {
        res.json(result);
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: "Ошибка сервера! Обратитесь к администратору"});
        //res.status(500).render('error/500');
    });
};

//POST-запрос на удаление пользователя
exports.deleteUser = function(req, res) {
    let user = req.session;
    let login = req.body.login;
    console.log(req.body);
    changeUserService.deleteUser(user, login).then(result => {
        res.json(result);
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.json({err: "Ошибка сервера! Обратитесь к администратору"});
    });
};