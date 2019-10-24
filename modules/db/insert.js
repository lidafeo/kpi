const query = require('../connectdb');

//USERVALUES

//добавить значение ПЭД
exports.insertValueKpi = function(login, name_kpi, value, date, start_date, finish_date, text, file, number_criterion) {
	let arr = [login, name_kpi, value, date, start_date, finish_date, text, file, number_criterion];
	return query("INSERT INTO uservalues(login_user, name_kpi, value, date, start_date, finish_date, " +
	"text, file, number_criterion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
}


//USERS

//добавление пользователя
exports.insertUser = function(name, position, faculty, department, login, password) {
	let arr = [name, position, faculty, department, login, password];
	return query("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", arr);
}

//добавление пользователя с объекта
exports.insertUserFromObj = function(user) {
	let arr = [user.name, user.position, user.faculty, user.department, user.login, user.password];
	return query("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", arr);
}

//KPI

//добавление kpi
exports.insertKpi = function(name, section, subtype, number, count_criterion, description, type, 
	indicator_sum, action_time) {
		let arr = [name, section, subtype, number, count_criterion, description, type, indicator_sum, action_time];
	return query("INSERT INTO kpi VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
}


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
}

function insertBalls(ball) {
	return query("INSERT INTO balls VALUES (?, ?, ?)", ball);
}
