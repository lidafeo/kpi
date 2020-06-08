const bcrypt = require("bcrypt");

let DB = require('../modules/db');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcStructure = require('../modules/func-structure');

//запрос страницы для добавления ППС
exports.pageAddPps = async function(user) {
    let info = await getPositionsAndStructure();
    let facultyArr = funcStructure.getFaculty(info.structure);
    let departmentArr = funcStructure.getDepartment(facultyArr[0], info.structure);
    return {positions: info.positions, faculty: facultyArr, department: departmentArr,
        infoUser: user, pageName: '/change-pps/add-pps'};
};

//запрос на добавление ППС
exports.addPps = async function(user, newUser) {
    if(!newUser.department || newUser.position == 'Декан') {
        newUser.department = null;
    }
    if(newUser.position == 'Декан' || newUser.position == 'Заведующий кафедрой') {
        newUser.role = 'Руководитель подразделения';
    } else {
        newUser.role = 'ППС';
    }
    let hashedPassword = await bcrypt.hash(newUser.password, BCRYPT_SALT_ROUNDS);
    newUser.password = hashedPassword;
    let result = await DB.users.insertUserFromObj(newUser);
    //запись логов
    writeLogs(user.login, user.position, "добавил(а) нового пользователя: login - " + newUser.login);
    console.log("Сохранен объект user");
    return  {result: 'Пользователь ' + newUser.login + ' успешно добавлен'};
};

//запрос страницы для изменения пароля ППС
exports.pageChangePassword = async function(user, loginUser) {
    let users = await DB.users.selectOneUser(loginUser);
    //проверка, что это ППС
    if(!users || users.length == 0 || !users[0].position)  {
        return null;
    }
    return {user: users[0], infoUser: user, pageName: '/change-pps/change-password'};
};

//запрос на изменение пароля ППС
exports.changePassword = async function(user, newUser) {
    if(!newUser || !newUser.login || !newUser.password || newUser.password.length < 3
        || newUser.password.length > 50) {
        return {err: 'Введите пароль от 3 до 50 символов'};
    }
    let hashedPassword = await bcrypt.hash(newUser.password, BCRYPT_SALT_ROUNDS);
    newUser.password = hashedPassword;
    let result = await DB.users.updatePassword(newUser.login, newUser.password);
    //запись логов
    writeLogs(user.login, user.position, "изменил(а) пароль пользователю: login - " + newUser.login);
    return {result: 'Пароль пользователя успешно изменен'};
};

async function getPositionsAndStructure() {
    let structure = await DB.structure.selectStructure();
    let positions = await DB.positions.selectPositions();
    return {'structure': structure, 'positions': positions};
}