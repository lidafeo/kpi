const query = require('../connectdb');

//USERS

//все пользователи
exports.selectAllUsers = function() {
	return query("SELECT name, position, faculty, department, login FROM users " +
		"ORDER BY name ASC");
}

//получить полную информацию о пользователе
exports.selectUserWithPositionInfo = async function(login) {
	return query("SELECT * from users " +
		"INNER JOIN positions ON users.position=positions.position " +
		"WHERE login=?", 
		login);
}

//получить всех пользователей из данного факультета/кафедры
exports.selectUserFromDepartment = function(faculty, department, level) {
	return query("SELECT name, users.position, login FROM users " +
		"INNER JOIN positions ON users.position=positions.position " +
		"WHERE (department=? OR (faculty=? AND department is NULL)) AND level<?", 
		[department, faculty, level]);
}

//получить одного пользователя
exports.selectOneUser = function(login) {
	return query("SELECT login FROM users " +
		"WHERE login=?",
		[login]);
}


//STRUCTURE

//получить полную структуру
exports.selectStructure = function() {
	return query("SELECT * from structure");
}

//получить структуру отсортированную по факультетам
exports.selectStructureOrderByFaculty = function() {
    return query("SELECT * from structure order by faculty ASC, department ASC");
}

//получить кафедры факультета
exports.selectDepartments = function(faculty) {
	return query("SELECT department FROM structure " +
		"WHERE faculty=?", 
		faculty);
}

//получить кафедру факультета
exports.selectOneDepartments = function(department) {
	return query("SELECT department FROM structure " +
		"WHERE department=?",
		department);
}

//получить факультет кафедры
exports.selectFacultyOfDepartment = function(department) {
	return query("SELECT faculty FROM structure " +
		"WHERE department=?",
		department);
}

//получить факультет
exports.selectOneFaculty = function(faculty) {
    return query("SELECT faculty FROM structure " +
        "WHERE faculty=? OR abbr_faculty=?",
        [faculty, faculty]);
}

//получить кафедру по аббривиатуре
exports.selectDepartmentByAbbr = function(abbr) {
    return query("SELECT department, faculty FROM structure " +
        "WHERE abbr_department=?",
        abbr);
}

//получить кафедру по аббривиатуре
exports.selectDepartment = function(dep) {
    return query("SELECT department, faculty FROM structure " +
        "WHERE abbr_department=? OR department=?",
        [dep, dep]);
}

//получить кафедру по аббривиатуре
exports.selectDepartmentWithLike = function(dep) {
    return query("SELECT department, faculty FROM structure " +
        "WHERE abbr_department=? OR department=? OR department LIKE '%" + dep + "%'",
        [dep, dep]);
}

//USERVALUES

//получить значения ПЭД всех пользователей
exports.selectAllValueKpi = function() {
	return query("SELECT * FROM uservalues " +
		"ORDER BY id DESC " +
		"LIMIT 100");
}

//получить значения ПЭД пользователя
exports.selectValueKpiUser = function(login) {
	return query("SELECT uservalues.*, type, criterion_description, users.name name_author FROM uservalues " +
		"INNER JOIN kpi ON kpi.name=uservalues.name_kpi " +
		"INNER JOIN criterions ON criterions.name_kpi=kpi.name AND " +
			"criterions.number_criterion=uservalues.number_criterion " +
		"LEFT JOIN users ON users.login=uservalues.author_verify " +
		"WHERE login_user=? " + 
		"ORDER BY date DESC", 
		login);
}

//получить действующие значения ПЭД пользователя в заданный период
exports.selectValueKpiUserInPeriod = function(userName, date1, date2) {
	return query("SELECT * FROM uservalues " +
		"INNER JOIN kpi ON kpi.name=uservalues.name_kpi " +
		"WHERE valid=1 AND login_user=? AND ((start_date BETWEEN DATE(?) AND DATE(?)) OR " +
			"(finish_date BETWEEN DATE(?) AND DATE(?)) OR ((start_date<=DATE(?)) AND (finish_date>=DATE(?)))) " +
		"ORDER BY section ASC, subtype ASC, number ASC, uservalues.number_criterion ASC", 
		[userName, date1, date2, date1, date2, date1, date2]);
}

//получить значения одного ПЭД пользователя
exports.selectValueKpiUserOneKpi = function(login, name_kpi) {
	return query("SELECT uservalues.*, users.name name_author FROM uservalues " +
		"LEFT JOIN users ON users.login=uservalues.author_verify " +
		"WHERE name_kpi=? AND login_user=? " +
		"ORDER BY date DESC " +
		"LIMIT 50", 
		[name_kpi, login]);
}

//получить значение одного ПЭД по id
exports.selectValueKpiById = function(id) {
	return query("SELECT file FROM uservalues " +
		"WHERE id=?", 
		id);
}

//получить значения ПЭД для пользователя по имени, должности, факультету, кафедре
exports.selectValueKpiByLogin = function(login) {
	return query("SELECT uservalues.id, uservalues.name_kpi, value, date, text, file, type, " +
		"criterion_description description " +
		"FROM uservalues " +
		"INNER JOIN kpi ON kpi.name=uservalues.name_kpi " +
		"INNER JOIN criterions ON criterions.name_kpi=kpi.name AND " +
			"criterions.number_criterion=uservalues.number_criterion " +
		"WHERE login_user=? AND valid=1 " +
		"ORDER BY date DESC", 
		[login]);
}


//KPI

//получить все ПЭД
exports.selectAllKpi = function() {
	return query("SELECT * FROM kpi " +
		"ORDER BY section ASC, subtype ASC, number ASC");
}

//получить все ПЭД с критериями
exports.selectAllKpiWithCriterion = function() {
	return query("SELECT * FROM kpi " +
		"INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
		"INNER JOIN balls ON balls.id_criterion=criterions.id " +
		"INNER JOIN positions ON positions.position=balls.position " + 
		"ORDER BY section ASC, subtype ASC, number ASC, name ASC, id_criterion ASC, " +
			"positions.number_group ASC, balls.position ASC");
}

//получить один ПЭД
exports.selectOneKpi = function(name) {
	return query("SELECT * FROM kpi " +
		"WHERE kpi.name=?", 
		name);
}


//получить один ПЭД с баллами
exports.selectOneKpiWithBalls = function(name) {
	return query("SELECT * FROM kpi " +
		"INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
		"INNER JOIN balls ON balls.id_criterion=criterions.id " +
		"INNER JOIN positions ON positions.position=balls.position "+
		"WHERE kpi.name=? " +
		"ORDER BY id_criterion ASC, positions.number_group ASC, balls.position ASC", 
		name);
}

//получить разделы
exports.selectAllSection = function() {
	return query("SELECT DISTINCT section FROM kpi");
}


//CRITERIONS

//получить все критерии
exports.selectAllCriterion = function(position) {
	return query("SELECT * FROM criterions, balls WHERE id=id_criterion AND position='" + position + 
	"' ORDER BY name_kpi, criterions.number_criterion ASC");
}


//POSITION

//получить все должности
exports.selectAllPosition = function() {
	return query("SELECT position FROM positions " +
		"ORDER BY number_group ASC, position ASC");
}

//выбрать должности, у которых есть ПЭД
exports.selectPositionWithBalls = function() {
	return query("SELECT position, level FROM positions " +
		"WHERE func_pps=1 " +
		"ORDER BY number_group ASC, position ASC");
}

//выбрать должность
exports.selectOnePosition = function(position) {
	return query("SELECT position, level FROM positions " +
		"WHERE position=?", position);
}
//выбрать должность используя LIKE
exports.selectOnePositionWithLike = function(position) {
    return query("SELECT position, level FROM positions " +
        "WHERE position=? OR position LIKE '%" + position + "%'", position);
}

//BALLS

//проверка баллов конкретного ПЭД 
exports.selectBallOneKpi = function(name, position) {
	return query("SELECT * FROM kpi " +
		"INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
		"INNER JOIN balls ON balls.id_criterion=criterions.id " +
		"WHERE kpi.name=? AND balls.position=? " +
		"ORDER BY id ASC", 
		[name, position]);
}


//ДЛЯ ПФУ
exports.forReportPFU = function(date1, date2) {

	return query("SELECT UV.name_kpi name_kpi, users.name name_user, login, COUNT(DISTINCT id) cou, value, type, " +
			"indicator_sum, number_criterion, " +
			"substring_index(group_concat(value order by date desc), ',', 1) as value_max_date " +
		"FROM uservalues UV " +
		"INNER JOIN kpi ON kpi.name=UV.name_kpi " +
		"INNER JOIN users ON  users.login=UV.login_user "+ 
		"WHERE (start_date BETWEEN DATE(?) AND DATE(?)) OR ((finish_date BETWEEN DATE(?) AND DATE(?)) OR " +
			"((start_date <= DATE(?)) AND (finish_date >= DATE(?)))) AND valid=1 " +
		"GROUP BY name_kpi, login, number_criterion " +
		"ORDER BY name_user ASC, users.login ASC, section ASC, subtype ASC, number ASC, number_criterion", 
		[date1, date2, date1, date2, date1, date2]);
}

exports.selectKpiAndUser = function() {
	return query("SELECT kpi.name name_kpi, users.name name_user, type, users.position, count_criterion, login, " +
			"faculty, department, number_group, indicator_sum, start_val, final_val, ball, number_criterion " +
		"FROM users, kpi, positions, criterions, balls " +
		"WHERE positions.number_group IS NOT NULL AND positions.position=users.position AND " +
			"criterions.name_kpi=kpi.name AND balls.position=positions.position AND " +
			"balls.id_criterion=criterions.id " +
		"ORDER BY users.name ASC, section ASC, subtype ASC, number ASC, number_criterion ASC");
}
