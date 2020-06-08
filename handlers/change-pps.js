let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let changePpsService = require('../services/change-pps');

//GET-запрос страницы для добавления ППС
exports.pageAddPps = function(req, res) {
    let user = req.session;
    changePpsService.pageAddPps(user).then(result => {
        res.render('change-pps/page-add-pps', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление ППС
exports.addPps = function(req, res) {
    let user = req.session;
    console.log("Добавление ППС");
    console.log(req.body);
    let newUser = req.body;
    changePpsService.addPps(user, newUser).then(result => {
        res.json(result);
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

//GET-запрос страницы для изменения пароля ППС
exports.pageChangePassword = function(req, res) {
    let user = req.session;
    let loginUser = req.query.login;
    console.log(loginUser);
    //проверка, что есть логин
    if(!loginUser)  {
        return res.status(404).render('error/404');
    }
    changePpsService.pageChangePassword(user, loginUser).then(result => {
       if(!result) {
           return res.status(404).render('error/404');
       }
        res.render('change-pps/page-change-password', result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на изменение пароля ППС
exports.changePassword = function(req, res) {
    let user = req.session;
    console.log("Изменение пароля ППС");
    console.log(req.body);
    let newUser = req.body;
    changePpsService.changePassword(user, newUser).then(result => {
        res.json(result);
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};