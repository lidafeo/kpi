const query = require('../connectdb');

//USER

//удаление пользователя
exports.deleteUser = function(login) {
	return query("DELETE FROM users WHERE login='" + login + "'");
}

//удаление всех ППС
exports.deleteAllPps = function() {
	return query("DELETE users FROM users " +
		"INNER JOIN positions ON positions.position = users.position " +
		"WHERE func_pps=1");
}

//KPI

//удаление ПЭД
exports.deleteKpi = function(name) {
	return query("DELETE FROM kpi WHERE name='" + name + "'");
}

//STRUCTURE

//очистка таблицы structure
exports.deleteStructure = function() {
	return query("DELETE FROM structure");
}