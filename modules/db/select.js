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
	return query("SELECT uservalues.*, type, criterion_description FROM uservalues, kpi, criterions " +
		"WHERE uservalues.name_kpi=kpi.name AND " +
		"kpi.name=criterions.name_kpi AND criterions.number_criterion=uservalues.number_criterion AND " +
		"login_user='" + login + "' " +
		"ORDER BY date");
}

//получить действующие значения ПЭД пользователя в заданный период
exports.selectValueKpiUserInPeriod = function(userName, date1, date2) {
	return query("SELECT * FROM uservalues, kpi WHERE kpi.name=uservalues.name_kpi AND valid=1 AND " +
		"login_user='" + userName + "' AND ((start_date BETWEEN DATE('" + date1 + "') AND DATE('" + date2 + 
		"')) OR (finish_date BETWEEN DATE('" + date1 + "') AND DATE('" + date2 + 
		"')) OR ((start_date <= DATE('" + date1 + "')) AND (finish_date >= DATE('" + date2 + "')))) " +
		"ORDER BY section ASC, subtype ASC, number ASC, uservalues.number_criterion ASC");
}

//получить значения одного ПЭД пользователя
exports.selectValueKpiUserOneKpi = function(login, name_kpi) {
	return query("SELECT * FROM uservalues " +
		"WHERE name_kpi='" + name_kpi + "' AND login_user='" + login + "'");
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
	return query("SELECT * FROM kpi, criterions, balls, positions WHERE kpi.name=criterions.name_kpi AND " +
	"balls.id_criterion=criterions.id AND balls.position=positions.position " +
	"ORDER BY section ASC, subtype ASC, number ASC, name ASC, id_criterion ASC, positions.number_group ASC, balls.position ASC");
}

//получить один ПЭД
exports.selectOneKpi = function(name, position) {
	return query("SELECT * FROM kpi, criterions, balls WHERE kpi.name=criterions.name_kpi AND kpi.name='" + 
	name + "' AND balls.id_criterion=criterions.id AND balls.position='" + position + "' " +
	"ORDER BY id ASC");
}

//получить один ПЭД с баллами
exports.selectOneKpiWithBalls = function(name) {
	return query("SELECT * FROM kpi, criterions, balls, positions WHERE kpi.name=criterions.name_kpi AND kpi.name='" + 
	name + "' AND balls.position=positions.position AND balls.id_criterion=criterions.id " +
	"ORDER BY id_criterion ASC, positions.number_group ASC, balls.position ASC");
}

//получить отделы
exports.selectAllSection = function() {
	return query("SELECT DISTINCT section FROM kpi");
}


//CRITERION

//Получить все критерии
exports.selectAllCriterion = function(position) {
	return query("SELECT * FROM criterions, balls WHERE id=id_criterion AND position='" + position + 
	"' ORDER BY name_kpi, criterions.number_criterion ASC");
}


//POSITION

//Получить все должности
exports.selectAllPosition = function() {
	return query("SELECT * FROM positions ORDER BY number_group ASC, position ASC");
}

//выбрать должности, у которых есть ПЭД
exports.selectPositionWithBalls = function() {
	return query("SELECT * FROM positions WHERE number_group IS NOT NULL ORDER BY number_group ASC, position ASC");
}


exports.forReportPFU = function(date1, date2) {

	let q = "WHERE (start_date BETWEEN DATE('" + date1 + "') AND DATE('" + date2 + "')) OR ((finish_date BETWEEN DATE('" +
	date1 + "') AND DATE('" + date2 + "')) OR ((start_date <= DATE('" + date1 + "')) AND (finish_date >= DATE('" + 
	date2 + "'))))";

	return query("SELECT UV.name_kpi name_kpi, users.name name_user, login, COUNT(DISTINCT id) cou, value, type, " +
	"indicator_sum, number_criterion, substring_index(group_concat(value order by date desc), ',', 1) as valuemaxdate " +
	"FROM uservalues UV " +
	"INNER JOIN kpi ON kpi.name=UV.name_kpi " +
	"INNER JOIN users ON  users.login=UV.login_user "+ 
	q + " " +
	"GROUP BY name_kpi, login, number_criterion " +
	"ORDER BY name_user ASC, users.login ASC, section ASC, subtype ASC, number ASC, number_criterion");
}

exports.selectKpiAndUser = function() {
	return query("SELECT kpi.name name_kpi, users.name name_user, type, users.position, count_criterion, login, " +
		"faculty, department, number_group, indicator_sum, start_val, final_val, ball, number_criterion " +
		"FROM users, kpi, positions, criterions, balls " +
		"WHERE positions.number_group IS NOT NULL AND positions.position=users.position AND " +
		"criterions.name_kpi=kpi.name AND balls.position=positions.position AND balls.id_criterion=criterions.id " +
		"ORDER BY users.name ASC, section ASC, subtype ASC, number ASC, number_criterion ASC");
}