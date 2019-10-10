const query = require('../connectdb');

//USERVALUE

//добавить значение ПЭД
exports.insertValueKpi = function(login, name_kpi, value, date, start_date, finish_date, text, file, number_criterion) {
	return query("INSERT INTO uservalue(login_user, name_kpi, value, date, start_date, finish_date, " +
		"text, file, number_criterion) VALUES('" + login + "', '" + name_kpi + "', " + value + ", DATE('" + date +
		"'), DATE('" + start_date + "'), DATE('" + finish_date + "'), '" + text + "', '" + file + "', " +
		number_criterion + ")");
}


//USER

//добавление пользователя
exports.insertUser = function(name, position, faculty, department, login, password) {
	return query("INSERT INTO user VALUES ('" + name + "', '" + position + "', " + checkSrtForNull(faculty) + 
		", " + checkSrtForNull(department) + ", '" + login + "', '" + password + "')");
}

//добавление пользователя с объекта
exports.insertUserFromObj = function(user) {
	return query("INSERT INTO user VALUES ('" + user.name + "', '" + user.position + "', " + 
		checkSrtForNull(user.faculty) + ", " + checkSrtForNull(user.department) + ", '" + user.login + 
		"', '" + user.password + "')");
}

//KPI

//добавление kpi
exports.insertKpi = function(name, section, subtype, number, count_criterion, description, type, 
	indicator_sum, action_time) {
	return query("INSERT INTO kpi VALUES ('" + name + "', '" + section + "', " + checkSrtForNull(subtype) + 
		", " + number + ", " + count_criterion + ", '" + description + "', " + type + ", " + 
		indicator_sum + ", " + action_time + ")");
}


//CRITERION

//добавление criterion
exports.insertCriterion = function(criterion) {
	let SQLballs = "" + criterion.balls[0];
	for(let i = 1; i < 6; i ++)
		SQLballs += ", " + criterion.balls[i];
	return query("INSERT INTO criterion VALUES (NULL, '" + criterion.name_kpi + "', '" + criterion.name_criterion + 
		"', " + criterion.number_criterion + ", " + checkSrtForNull(criterion.description) + ", " + 
		criterion.start_val + ", " + criterion.final_val + ", " + SQLballs + ")");
}


function checkSrtForNull(str) {
	return str ? ("'" + str + "'") : str;
}