//const pool = require('../connectdb');
const query = require('../connectdb');

//USER

//все пользователи
exports.selectAllUsers = function() {
	return query("SELECT name, position, faculty, department, login FROM user ORDER BY name ASC");
	//return pool.query("SELECT * FROM user");
}

//получить полную информацию о пользователе
exports.selectUserWithPositionInfo = async function(login) {
	return query("SELECT * from user, position WHERE user.position=position.position AND login='" + 
		login + "'");
}

exports.selectUserFromDepartment = function(faculty, department, level) {
	return query("SELECT * FROM user, position WHERE user.position=position.position AND (department='" + 
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
	return query("SELECT * FROM uservalue, user WHERE uservalue.login_user=user.login ORDER BY id DESC LIMIT 50");
}
//получить значения ПЭД пользователя
exports.selectValueKpiUser = function(login) {
	return query("SELECT *, uservalue.id id FROM uservalue, kpi, criterion WHERE uservalue.name_kpi=kpi.name AND " +
		"kpi.name=criterion.name_kpi AND criterion.number_criterion=uservalue.number_criterion AND " +
		"login_user='" + login + "' ORDER BY date");
}

//получить действующие значения ПЭД пользователя в заданный период
exports.selectValueKpiUserInPeriod = function(userName, date1, date2) {
	return query("SELECT * FROM uservalue, kpi WHERE kpi.name=uservalue.name_kpi AND valid=1 AND " +
		"login_user='" + userName + "' AND ((start_date BETWEEN DATE('" + date1 + "') AND DATE('" + date2 + 
		"')) OR (finish_date BETWEEN DATE('" + date1 + "') AND DATE('" + date2 + 
		"')) OR ((start_date <= DATE('" + date1 + "')) AND (finish_date >= DATE('" + date2 + "')))) " +
		"ORDER BY section ASC, subtype ASC, number DESC");
}

//получить значения одного ПЭД пользователя
exports.selectValueKpiUserOneKpi = function(login, name_kpi) {
	return query("SELECT * FROM uservalue WHERE name_kpi='" + name_kpi + "' AND login_user='" + login + "'");
}

//получить значение одного ПЭД по id
exports.selectValueKpiById = function(id) {
	return query("SELECT * FROM uservalue WHERE id=" + id);
}

//получить значения ПЭД для пользователя по имени, должности, факультету, кафедре
exports.selectValueKpiByNameAndPosition = function(name, position, faculty, department) {
	let SQLdepartment = "='" + department + "'";
	if(position == "Декан")
		SQLdepartment = " IS NULL";
	return query("SELECT uservalue.id, uservalue.name_kpi, value, date, text, file, type, criterion_description description " +
		"FROM uservalue, user, kpi, criterion WHERE user.login=uservalue.login_user AND kpi.name=uservalue.name_kpi " +
		"AND criterion.name_kpi=kpi.name AND criterion.number_criterion=uservalue.number_criterion " +
		"AND user.name='" + name + "' AND position='" + position + "' AND faculty='" + faculty + 
		"' AND department" + SQLdepartment + " AND valid=1");
}


//KPI

//получить все ПЭД
exports.selectAllKpi = function() {
	return query("SELECT * FROM kpi ORDER BY section ASC, subtype ASC, number ASC");
}

//получить все ПЭД с критериями
exports.selectAllKpiWithCriterion = function() {
	return query("SELECT * FROM kpi, criterion WHERE kpi.name=criterion.name_kpi ORDER BY section ASC, "+
		"subtype ASC, number ASC, number_criterion ASC");
}

//получить один ПЭД
exports.selectOneKpi = function(name) {
	return query("SELECT * FROM kpi, criterion WHERE kpi.name=criterion.name_kpi AND kpi.name='" + name + "'");
}

//получить отделы
exports.selectAllSection = function() {
	return query("SELECT DISTINCT section FROM kpi");
}


//CRITERION

//Получить все критерии
exports.selectAllCriterion = function() {
	return query("SELECT * FROM criterion ORDER BY name_kpi");
}


//POSITION

exports.selectAllPosition = function() {
	return query("SELECT * FROM position ORDER BY level ASC");
}




exports.forReportPFU = function(date1, date2) {
	return query("SELECT *, user.name name_user, kpi.name name_kpi FROM user, uservalue, position, criterion, " + 
		"kpi WHERE user.position=position.position AND position.number_group is NOT NULL AND " +
		"user.login=uservalue.login_user AND kpi.name=uservalue.name_kpi AND valid=1 AND " +
		"criterion.name_kpi=kpi.name AND ((type=1 AND ((criterion.start_val<=uservalue.value) AND " +
		"((criterion.final_val>=uservalue.value) OR (criterion.final_val is NULL)))) OR (type=2 AND " +
		"uservalue.number_criterion=criterion.number_criterion)) AND ((uservalue.start_date BETWEEN DATE('" + 
		date1 + "') AND DATE('" + date2 + "')) OR (uservalue.finish_date BETWEEN DATE('" + date1 + 
		"') AND DATE('" + date2 + "')) OR ((uservalue.start_date <= DATE('" + date1 + 
		"')) AND (uservalue.finish_date >= DATE('" + date2 + "')))) " +
		"ORDER BY user.name ASC, kpi.section ASC, kpi.subtype ASC, kpi.number ASC, uservalue.number_criterion");
}

exports.selectKpiAndUser = function() {
	return query("SELECT kpi.name name_kpi, user.name name_user, type, count_criterion, login, user.position, " +
		"faculty, department, number_group FROM user, kpi, position WHERE position.position=user.position AND " +
		"position.number_group IS NOT NULL " +
		"ORDER BY user.name ASC, section ASC, subtype ASC, number ASC");
}