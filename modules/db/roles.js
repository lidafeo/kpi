const query = require('./connect-db');

//добавление role
exports.insertRole = function(role) {
    return query("INSERT INTO roles VALUES (?)", [role]);
};

//получить все роли
exports.selectAllRole = function() {
    return query("SELECT role FROM roles " +
        "ORDER BY role ASC");
};