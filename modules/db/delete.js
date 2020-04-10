const query = require('../connectdb');

//USER

//удаление пользователя
exports.deleteUser = function(login) {
	return query("DELETE FROM users WHERE login='" + login + "'");
};

//удаление всех ППС
exports.deleteAllPps = function() {
	return query("DELETE users FROM users " +
		"WHERE role='ППС' OR role='Руководитель подразделения'");
};

//KPI

//удаление ПЭД
exports.deleteKpi = function(name) {
	return query("DELETE FROM kpi WHERE name='" + name + "'");
};

//STRUCTURE

//очистка таблицы structure
exports.deleteStructure = function() {
	return query("DELETE FROM structure");
};

//USERVALUE

//очистка таблицы uservalues
exports.deleteAllUservalues = function() {
	return query("DELETE FROM uservalues");
};