const bcrypt = require("bcrypt");

let BCRYPT_SALT_ROUNDS = 12;

//функции работы с БД
let DBu = require('../modules/db/update.js');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//GET-запрос страницы изменения пароля
exports.pageChangePassword = function(req, res) {
    res.render('page-settings', {action: 0, infoUser: req.session, pageName: '/settings'});
};

//POST-запрос для смены пароля
exports.changePassword = function(req, res) {
    let password = req.body.password;
    let login = req.session.login;
    if(password) {
        changePassword(login, password).then(result => {
            //записываем логи
            writeLogs(login, req.session.position, "изменил(а) пароль");
            res.json({result: 'Пароль успешно изменен'});
            //res.render('pps/page_settings', {level: req.session.level, action: 1});
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.status(500).render('error/500');
        });
    }
    else {
        console.log("Задан пустой пароль");
        res.json({err: 'Пустой пароль'});
        //res.render('pps/page_settings', {level: req.session.level});
    }
};


//обновление пароля
async function changePassword (login, password) {
    let passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await DBu.updatePassword(login, passwordHash);
}