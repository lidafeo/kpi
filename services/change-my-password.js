const bcrypt = require("bcrypt");

let BCRYPT_SALT_ROUNDS = 12;

let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//запрос для смены пароля
exports.changePassword = async function(user, password) {
    if(password) {
        let result = await changePassword(user.login, password);
        //записываем логи
        writeLogs(user.login, user.position, "изменил(а) пароль");
        return {result: 'Пароль успешно изменен'};
    }
    console.log("Задан пустой пароль");
    return {err: 'Пустой пароль'};
};

//обновление пароля
async function changePassword (login, password) {
    let passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await DB.users.updatePassword(login, passwordHash);
}