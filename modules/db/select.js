//const pool = require('../connectdb');
const query = require('../connectdb');

//USER

//все пользователи
exports.selectAllUsers = function() {
	return query("SELECT name, position, faculty, department, login FROM users ORDER BY name ASC");
	//return pool.query("SELECT * FROM user");
}

//получить полную информацию о пользователе
exports.selectUserWithPositionInfo = async function(login) {
	return query("SELECT * from users, positions WHERE users.position=positions.position AND login='" + 
		login + "'");
}

exports.selectUserFromDepartment = function(faculty, department, level) {
	return query("SELECT * FROM users, positions WHERE users.position=positions.position AND (department='" + 
		department + "' OR (faculty='" + faculty + "' AND department is NULL)) AND level<" + level);
}


//STUCTURE

//получить полную структуру
exports.selectStructure = function() {
	return query("SELECT * from structure");
}

//получить кафедры факультета
exports.selectDepartments = function(faculty) {
	return query("SELECT department FROM structure WHERE faculty='" + faculty + "'");
}


//USERVALUE

//получить значения ПЭД всех пользователей
exports.selectAllValueKpi = function() {
	return query("SELECT * FROM uservalues, users WHERE uservalues.login_user=users.login ORDER BY id DESC LIMIT 50");
}
//получить значения ПЭД пользователя
exports.selectValueKpiUser = function(login) {
	return query("SELECT *, uservalues.id id FROM uservalues, kpi, criterions WHERE uservalues.name_kpi=kpi.name AND " +
		"kpi.name=criterions.name_kpi AND criterions.number_criterion=uservalues.number_criterion AND " +
		"login_user='" + login + "' ORDER BY date");
}

//получить действующие значения ПЭД пользователя в заданный период
exports.selectValueKpiUserInPeriod = function(userName, date1, date2) {
	return query("SELECT * FROM uservalues, kpi WHERE kpi.name=uservalues.name_kpi AND valid=1 AND " +
		"login_user='" + userName + "' AND ((start_date BETWEEN DATE('" + date1 + "') AND DATE('" + date2 + 
		"')) OR (finish_date BETWEEN DATE('" + date1 + "') AND DATE('" + date2 + 
		"')) OR ((start_date <= DATE('" + date1 + "')) AND (finish_date >= DATE('" + date2 + "')))) " +
		"ORDER BY section ASC, subtype ASC, number DESC");
}

//получить значения одного ПЭД пользователя
exports.selectValueKpiUserOneKpi = function(login, name_kpi) {
	return query("SELECT * FROM uservalues WHERE name_kpi='" + name_kpi + "' AND login_user='" + login + "'");
}

//получить значение одного ПЭД по id
exports.selectValueKpiById = function(id) {
	return query("SELECT * FROM uservalues WHERE id=" + id);
}

//получить значения ПЭД для пользователя по имени, должности, факультету, кафедре
exports.selectValueKpiByNameAndPosition = function(name, position, faculty, department) {
	let SQLdepartment = "='" + department + "'";
	if(position == "Декан")
		SQLdepartment = " IS NULL";
	return query("SELECT uservalues.id, uservalues.name_kpi, value, date, text, file, type, " +
		"criterion_description description " +
		"FROM uservalues, users, kpi, criterions WHERE users.login=uservalues.login_user AND " +
		"kpi.name=uservalues.name_kpi " +
		"AND criterions.name_kpi=kpi.name AND criterions.number_criterion=uservalues.number_criterion " +
		"AND users.name='" + name + "' AND position='" + position + "' AND faculty='" + faculty + 
		"' AND department" + SQLdepartment + " AND valid=1");
}


//KPI

//получить все ПЭД
exports.selectAllKpi = function() {
	return query("SELECT * FROM kpi ORDER BY section ASC, subtype ASC, number ASC");
}

//получить все ПЭД с критериями
exports.selectAllKpiWithCriterion = function() {
	return query("SELECT * FROM kpi, criterions WHERE kpi.name=criterions.name_kpi ORDER BY section ASC, "+
		"subtype ASC, number ASC, number_criterion ASC");
}

//получить один ПЭД
exports.selectOneKpi = function(name) {
	return query("SELECT * FROM kpi, criterions WHERE kpi.name=criterions.name_kpi AND kpi.name='" + name + "'");
}

//получить отделы
exports.selectAllSection = function() {
	return query("SELECT DISTINCT section FROM kpi");
}


//CRITERION

//Получить все критерии
exports.selectAllCriterion = function() {
	return query("SELECT * FROM criterions ORDER BY name_kpi");
}


//POSITION

exports.selectAllPosition = function() {
	return query("SELECT * FROM positions ORDER BY level ASC");
}




exports.forReportPFU = function(date1, date2) {
	return query("SELECT *, users.name name_user, kpi.name name_kpi FROM users, uservalues, positions, criterions, " + 
		"kpi WHERE users.position=positions.position AND positions.number_group is NOT NULL AND " +
		"users.login=uservalues.login_user AND kpi.name=uservalues.name_kpi AND valid=1 AND " +
		"criterions.name_kpi=kpi.name AND ((type=1 AND ((criterions.start_val<=uservalues.value) AND " +
		"((criterions.final_val>=uservalues.value) OR (criterions.final_val is NULL)))) OR (type=2 AND " +
		"uservalues.number_criterion=criterions.number_criterion)) AND ((uservalues.start_date BETWEEN DATE('" + 
		date1 + "') AND DATE('" + date2 + "')) OR (uservalues.finish_date BETWEEN DATE('" + date1 + 
		"') AND DATE('" + date2 + "')) OR ((uservalues.start_date <= DATE('" + date1 + 
		"')) AND (uservalues.finish_date >= DATE('" + date2 + "')))) " +
		"ORDER BY users.name ASC, kpi.section ASC, kpi.subtype ASC, kpi.number ASC, uservalues.number_criterion");
}

exports.selectKpiAndUser = function() {
	return query("SELECT kpi.name name_kpi, users.name name_user, type, count_criterion, login, users.position, " +
		"faculty, department, number_group FROM users, kpi, positions WHERE positions.position=users.position AND " +
		"positions.number_group IS NOT NULL " +
		"ORDER BY users.name ASC, section ASC, subtype ASC, number ASC");
}