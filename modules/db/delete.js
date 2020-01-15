const query = require('../connectdb');

//USER

//удаление пользователя
exports.deleteUser = function(login) {
	return query("DELETE FROM users WHERE login='" + login + "'");
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