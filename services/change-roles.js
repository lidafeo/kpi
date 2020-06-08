let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//запрос страницы для добавления роли
exports.pageAddRole = async function(user) {
    let rights = await DB.rights.selectAllRights();
    return {rights: rights, infoUser: user, pageName: '/change-roles/add-role'};
};

//запрос на добавление роли
exports.addRole = async function(user, role, rights) {
    let result = await DB.roles.insertRole(role);
    //записываем логи
    writeLogs(user.login, user.position, "добавил(а) роль " + role);
    if (rights && rights.length > 0) {
        let result = await Promise.all(rights.map(el => {
            DB.rightsRoles.insertRightsInRole(el, role);
        }));
        //записываем логи
        writeLogs(user.login, user.position, "добавил(а) права роли " + role);
        return {result: 'Роль ' + role + ' успешно добавлена'};
    }
    return {err: 'Не удалось добавить роль'};
};