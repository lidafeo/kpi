const bcrypt = require("bcrypt");

let DB = require('../modules/db');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcStructure = require('../modules/func-structure');

//запрос страницы для добавления сотрудника
exports.pageAddUser = async function(user) {
    let info = await getRolesAndPositionsAndStructure();
    let facultyArr = funcStructure.getFaculty(info.structure);
    let departmentArr = funcStructure.getDepartment(facultyArr[0], info.structure);
    return {roles: info.roles, positions: info.positions, faculty: facultyArr,
        department: departmentArr, infoUser: user, pageName: '/change-users/add-user'};
};

//запрос страницы для изменения сотрудника
exports.pageChangeUser = async function(user, loginUser) {
    let info = await getRolesAndPositionsAndStructure();
    let userForChange = await DB.users.selectOneUser(loginUser);
    if(!userForChange[0]) {
        throw new Error("Пользователь не найден");
    }
    let facultyArr = funcStructure.getFaculty(info.structure);
    let departmentArr = funcStructure.getDepartment(userForChange[0].faculty, info.structure);
    return {roles: info.roles, positions: info.positions, faculty: facultyArr,
        department: departmentArr, user: userForChange[0], infoUser: user,
        pageName: '/change-users/change-user'};
};

//запрос на добавление пользователя
exports.addUser = async function(user, newUser) {
    if(!newUser.faculty)
        newUser.faculty = null;
    if(!newUser.department)
        newUser.department = null;
    let hashedPassword = await bcrypt.hash(newUser.password, BCRYPT_SALT_ROUNDS);
    newUser.password = hashedPassword;
    let userFromDb = await DB.users.selectOneUser(newUser.login);
    if(userFromDb[0]) {
        return {err: 'Пользователь с таким логином уже существует!'};
    }
    let result = await DB.users.insertUserFromObj(newUser);
    //запись логов
    writeLogs(user.login, user.position, "добавил(а) нового пользователя: login - " + newUser.login);
    console.log("Сохранен объект user");
    return {result: 'Пользователь успешно добавлен'};
};

//запрос на изменение пользователя
exports.changeUser = async function(user, loginUser, newUser) {
    if(!newUser.faculty)
        newUser.faculty = null;
    if(!newUser.department)
        newUser.department = null;
    let result = await DB.users.updateUser(loginUser, newUser);
    //запись логов
    writeLogs(user.login, user.position, "изменил(а) информацию пользователя: login - " + loginUser);
    return {result: 'Пользователь успешно изменен'};
};

//запрос на удаление пользователя
exports.deleteUser = async function(user, login) {
    let result = await DB.users.deleteUser(login);
    if(result.affectedRows > 0) {
        console.log("Удален пользователь: ", login);
        //записываем логи
        writeLogs(user.login, user.position, "удалил(а) пользователя " + login);
        return {result: 'Пользователь успешно удален'};
    }
    console.log("Нет такого пользователя: " + login);
    return {err: 'Не удалось удалить пользователя'};
};

async function getRolesAndPositionsAndStructure() {
    let roles = await DB.roles.selectAllRole();
    let structure = await DB.structure.selectStructure();
    let positions = await DB.positions.selectPositions();
    return {'roles': roles, 'structure': structure, 'positions': positions};
}