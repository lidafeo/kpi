const query = require('../connectdb');

//USERVALUES

//добавить значение ПЭД
exports.insertValueKpi = function(val) {
	let arr = [val.login, val.name_kpi, val.value, val.date, val.start_date,
		val.finish_date, val.text, val.link, val.file, val.number_criterion];
	return query("INSERT INTO uservalues(login_user, name_kpi, value, date, start_date, finish_date, " +
	"text, link, file, number_criterion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};

//добавить значение ПЭД с объекта
exports.insertValueKpiFromObj = function(uservalue) {
	let arr = [uservalue.login_user, uservalue.name_kpi, uservalue.value, uservalue.date,
		uservalue.start_date, uservalue.finish_date, uservalue.text, uservalue.link, uservalue.file,
		uservalue.number_criterion];
	return query("INSERT INTO uservalues(login_user, name_kpi, value, date, start_date, finish_date, " +
		"text, link, file, number_criterion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};


//USERS

//добавление пользователя с объекта
exports.insertUserFromObj = function(user) {
	if(!user.department) {
		user.department = null;
	}
	if(!user.position) {
		user.position = null;
	}
	//if(user.department) {
		let arr = [user.name, user.role, user.position, user.faculty, user.department, user.login, user.password];
		return query("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", arr);
	//}
	//let arr = [user.name, user.role, user.position, user.faculty, user.login, user.password];
	//return query("INSERT INTO users(name, role, position, faculty, login, password) VALUES (?, ?, ?, ?, ?, ?)", arr);
};

//ROLE

//добавление role
exports.insertRole = function(role) {
	return query("INSERT INTO roles VALUES (?)", [role]);
};

//RIGHTS_ROLE

//добавление role
exports.insertRightsInRole = function(right, role) {
	return query("INSERT INTO rights_roles (role, right_name) VALUES (?, ?)",
		[role, right]);
};

//KPI

//добавление kpi
exports.insertKpi = function(name, section, subtype, number, count_criterion, description, type, 
	indicator_sum, action_time) {
		let arr = [name, section, subtype, number, count_criterion, description, type, indicator_sum, action_time];
	return query("INSERT INTO kpi VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};

//STRUCTURE

//добавление каферды с объекта
exports.insertDepartment = function(dep) {
	return query("INSERT INTO structure VALUES (?, ?, ?, ?)", [dep.faculty, dep.department, dep.abbr_faculty, dep.abbr_department]);
};

//CRITERIONS

//добавление criterion
exports.insertCriterion = function(criterion) {
	let arr = [criterion.name_kpi, criterion.name_criterion, criterion.number_criterion, criterion.description,
		criterion.start_val, criterion.final_val];
		let balls = criterion.balls;
	return new Promise((resolve, reject) => {
		query("INSERT INTO criterions VALUES (NULL, ?, ?, ?, ?, ?, ?)", arr).then(result => {
			for(let i = 0; i < balls.length; i++)
				balls[i][0] = result.insertId;
			Promise.all(balls.map(insertBalls)).then(result => {
				resolve(result);
			}).catch(err => {
				console.log(err);
				reject(err);
			});
		}).catch(err => {
			console.log(err);
			reject(err);
		});
	});
};

function insertBalls(ball) {
	return query("INSERT INTO balls VALUES (?, ?, ?)", ball);
}
