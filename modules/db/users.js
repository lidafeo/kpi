const query = require('./connect-db');

//INSERT

//добавление пользователя с объекта
exports.insertUserFromObj = function(user) {
    if(!user.department) {
        user.department = null;
    }
    if(!user.position) {
        user.position = null;
    }
    let arr = [user.name, user.role, user.position, user.faculty, user.department, user.login, user.password];
    return query("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", arr);
};

//DELETE

//удаление пользователя
exports.deleteUser = function(login) {
    return query("DELETE FROM users WHERE login='" + login + "'");
};

//удаление всех ППС
exports.deleteAllPps = function() {
    return query("DELETE FROM users " +
        "WHERE role='ППС' OR role='Руководитель подразделения'");
};

//SELECT

//выбрать всех пользователей
exports.selectAllUsers = function() {
    return query("SELECT name, role, position, faculty, department, login FROM users " +
        "ORDER BY name ASC");
};

//выбрать всех ППС
exports.selectAllPps = function() {
    return query("SELECT * FROM users " +
        "WHERE position IS NOT NULL " +
        "ORDER BY name ASC");
};

//получить полную информацию о пользователе
exports.selectUserByLogin = function(login) {
    return query("SELECT * from users " +
        "LEFT JOIN positions ON positions.position=users.position " +
        "WHERE login=? ",
        [login]);
};

//получить всех пользователей из данного факультета/кафедры
exports.selectUserFromDepartment = function(faculty, department, level) {
    return query("SELECT name, users.position, login FROM users " +
        "INNER JOIN positions ON users.position=positions.position " +
        "WHERE (department=? OR (faculty=? AND department is NULL)) AND level<?",
        [department, faculty, level]);
};

//получить одного пользователя
exports.selectOneUser = function(login) {
    return query("SELECT * FROM users " +
        "WHERE login=?",
        [login]);
};

//получить одного пользователя по ФИО
exports.selectOneUserByName = function(name) {
    return query("SELECT login FROM users " +
        "WHERE name=?",
        [name]);
};

//UPDATE

//меняем пароль пользователю
exports.updatePassword = function(login, newPassword) {
    return query("UPDATE users SET password='" + newPassword +
        "' WHERE login=?", [login]);
};

//добавление пользователя с объекта
exports.updateUser = function(login, user) {
    if(!user.faculty) {
        user.faculty = null;
    }
    if(!user.department) {
        user.department = null;
    }
    if(!user.position) {
        user.position = null;
    }
    let arr = [user.name, user.role, user.position, user.faculty, user.department, login];
    return query("UPDATE users SET name=?, role=?, position=?, faculty=?, " +
        "department=? WHERE login=?", arr);
};