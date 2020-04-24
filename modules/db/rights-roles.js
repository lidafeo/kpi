const query = require('./connect-db');

//добавление role с правом right
exports.insertRightsInRole = function(right, role) {
    return query("INSERT INTO rights_roles (role, right_name) VALUES (?, ?)",
        [role, right]);
};

//найти права роли
exports.selectRightsRolesByRole = function(role) {
    return query("SELECT right_name from rights_roles where role=? AND active=1", [role]);
};

//выбрать все права всех ролей
exports.selectAllRightsRolesOrderByRole = function() {
    return query("SELECT * from rights_roles where active=1 ORDER BY role ASC");
};