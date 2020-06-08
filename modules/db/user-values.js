const query = require('./connect-db');

//INSERT

//добавить значение ПЭД
exports.insertValueKpi = function(val) {
    let arr = [val.login, val.name_kpi, val.value, val.date, val.start_date,
        val.finish_date, val.text, val.link, val.file, val.number_criterion];
    return query("INSERT INTO user_values(login_user, name_kpi, value, date, start_date, finish_date, " +
        "text, link, file, number_criterion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};

//добавить значение ПЭД с объекта
exports.insertValueKpiFromObj = function(userValue) {
    let arr = [userValue.login_user, userValue.name_kpi, userValue.value, userValue.date,
        userValue.start_date, userValue.finish_date, userValue.text, userValue.link, userValue.file,
        userValue.number_criterion];
    return query("INSERT INTO user_values(login_user, name_kpi, value, date, start_date, finish_date, " +
        "text, link, file, number_criterion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};

//добавить значение ПЭД с объекта со статусом
exports.insertValueKpiFromObjWithValid = function(userValue) {
    let arr = [userValue.login_user, userValue.name_kpi, userValue.value, userValue.date,
        userValue.start_date, userValue.finish_date, userValue.text, userValue.link, userValue.file,
        userValue.number_criterion, userValue.valid];
    return query("INSERT INTO user_values(login_user, name_kpi, value, date, start_date, finish_date, " +
        "text, link, file, number_criterion, valid) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};
//DELETE

//очистка таблицы user_values
exports.deleteAllUserValues = function() {
    return query("DELETE FROM user_values");
};

//удаление одного значения
exports.deleteVal = function(id, login) {
    return query("DELETE FROM user_values WHERE id=? AND login_user=?",
        [id, login]);
};

//SELECT

//получить значения ПЭД всех пользователей в заданный период
exports.selectAllValueKpiInPeriod = function(date1, date2) {
    return query("SELECT * FROM user_values " +
        "WHERE ((start_date BETWEEN DATE(?) AND DATE(?)) OR " +
        "(finish_date BETWEEN DATE(?) AND DATE(?)) OR ((start_date<=DATE(?)) AND (finish_date>=DATE(?)))) " +
        "ORDER BY date DESC, id DESC " +
        "LIMIT 1000",
        [date1, date2, date1, date2, date1, date2]);
};

//получить все значения ПЭД
exports.selectAllValueKpi = function() {
    return query("SELECT * FROM user_values");
};

//получить значения ПЭД пользователя
exports.selectValueKpiOfUser = function(login) {
    return query("SELECT user_values.*, type, criterion_description, users.name name_author FROM user_values " +
        "INNER JOIN kpi ON kpi.name=user_values.name_kpi " +
        "INNER JOIN criterions ON criterions.name_kpi=kpi.name AND " +
        "criterions.number_criterion=user_values.number_criterion " +
        "LEFT JOIN users ON users.login=user_values.author_verify " +
        "WHERE login_user=? " +
        "ORDER BY date DESC, user_values.id DESC " +
        "LIMIT 100",
        [login]);
};

//получить действующие значения ПЭД пользователя в заданный период
exports.selectValueKpiUserInPeriod = function(userName, date1, date2) {
    return query("SELECT * FROM user_values " +
        "INNER JOIN kpi ON kpi.name=user_values.name_kpi " +
        "WHERE valid=1 AND login_user=? AND ((start_date BETWEEN DATE(?) AND DATE(?)) OR " +
        "(finish_date BETWEEN DATE(?) AND DATE(?)) OR ((start_date<=DATE(?)) AND (finish_date>=DATE(?)))) " +
        "ORDER BY section ASC, subtype ASC, number ASC, user_values.number_criterion ASC",
        [userName, date1, date2, date1, date2, date1, date2]);
};

//получить действующие значения ПЭД пользователя в заданный период и отсортировать по дате добавления
exports.selectAllValueKpiUserInPeriodOrderByDate = function(userName, date1, date2) {
    return query("SELECT * FROM user_values " +
        "INNER JOIN kpi ON kpi.name=user_values.name_kpi " +
        "WHERE login_user=? AND ((start_date BETWEEN DATE(?) AND DATE(?)) OR " +
        "(finish_date BETWEEN DATE(?) AND DATE(?)) OR ((start_date<=DATE(?)) AND (finish_date>=DATE(?)))) " +
        "ORDER BY date DESC, user_values.id DESC ",
        [userName, date1, date2, date1, date2, date1, date2]);
};

//получить действующие значения ПЭД пользователя в заданный период и отсортировать по дате добавления
exports.selectValidValueKpiUserInPeriodOrderByDate = function(userName, date1, date2) {
    return query("SELECT * FROM user_values " +
        "INNER JOIN kpi ON kpi.name=user_values.name_kpi " +
        "WHERE valid=1 AND login_user=? AND ((start_date BETWEEN DATE(?) AND DATE(?)) OR " +
        "(finish_date BETWEEN DATE(?) AND DATE(?)) OR ((start_date<=DATE(?)) AND (finish_date>=DATE(?)))) " +
        "ORDER BY date DESC, user_values.id DESC ",
        [userName, date1, date2, date1, date2, date1, date2]);
};

//получить значения одного ПЭД конкретного пользователя
exports.selectValueKpiOfUserOneKpi = function(login, name_kpi) {
    return query("SELECT user_values.*, users.name name_author FROM user_values " +
        "LEFT JOIN users ON users.login=user_values.author_verify " +
        "WHERE name_kpi=? AND login_user=? " +
        "ORDER BY date DESC, user_values.id DESC " +
        "LIMIT 30",
        [name_kpi, login]);
};
/*
//получить файл одного значения ПЭД по id
exports.selectFileValueKpiById = function(id) {
    return query("SELECT file FROM user_values " +
        "WHERE id=?",
        [id]);
};
 */

//получить значение одного ПЭД по id с проверкой пользователя
exports.selectValueKpiById = function(id, login) {
    return query("SELECT user_values.*, kpi.type, kpi.description, kpi.indicator_sum, " +
        "criterions.criterion_description, users.name author_verify_name, " +
        "users.role author_verify_role FROM user_values " +
        "INNER JOIN kpi ON user_values.name_kpi = kpi.name " +
        "INNER JOIN criterions ON criterions.name_kpi = user_values.name_kpi " +
        "AND criterions.number_criterion = user_values.number_criterion " +
        "LEFT JOIN users ON users.login = user_values.author_verify " +
        "WHERE user_values.id=? AND login_user=?",
        [id, login]);
};

//получить значение одного ПЭД по id для проверки руководителем структурных подразделений
exports.selectValueKpiByIdForVerify = function(id) {
    return query("SELECT user_values.*, kpi.type, kpi.description, " +
            "criterions.criterion_description, users.name, users.department, " +
            "users.faculty FROM user_values " +
        "INNER JOIN kpi ON user_values.name_kpi = kpi.name " +
        "INNER JOIN criterions ON criterions.name_kpi = user_values.name_kpi " +
        "AND criterions.number_criterion = user_values.number_criterion " +
        "INNER JOIN users ON users.login = user_values.login_user " +
        "WHERE user_values.id=?",
        [id]);
};

//получить значения ПЭД для пользователя по логину
exports.selectValueKpiByLogin = function(login) {
    return query("SELECT user_values.id, user_values.name_kpi, value, date, text, file, type, " +
        "valid, criterion_description description " +
        "FROM user_values " +
        "INNER JOIN kpi ON kpi.name=user_values.name_kpi " +
        "INNER JOIN criterions ON criterions.name_kpi=kpi.name AND " +
        "criterions.number_criterion=user_values.number_criterion " +
        "WHERE login_user=? " +
        "ORDER BY date DESC",
        [login]);
};

//UPDATE

//помечаем недействительный ПЭД
exports.updateValueInvalid = function(id, author, text) {
    return query("UPDATE user_values SET author_verify='" + author + "', text_verify='" + text +
        "', valid=0 WHERE id=" + id);
};

//отменяем недействительный ПЭД
exports.updateValueCancelInvalid = function(id, login) {
    return query("UPDATE user_values SET author_verify=NULL, text_verify=NULL, valid=1 " +
        "WHERE id=? AND author_verify=?", [id, login]);
};

//изменяем поля значения
exports.updateFieldValue = function(id, nameField, valueField) {
    return query("UPDATE user_values SET " + nameField + "=? " +
        "WHERE id=?", [valueField, id]);
};