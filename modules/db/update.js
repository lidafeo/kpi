const query = require('../connectdb');

//USERVALUE

//помечаем недействительный ПЭД
exports.updateValueInvalid = function(id, author, text) {
	return query("UPDATE uservalue SET author_verify='" + author + "', text_verify='" + text + 
		"', valid=0 WHERE id=" + id);
}


//CRITERION

//изменяем оценки ПЭД
exports.updateBallOfCriterion = function(criterion) {
	let balls = "ball_0=" + criterion.balls[0];
	for(let i = 1; i < 6; i++)
		balls += ", ball_" + i + "=" + criterion.balls[i];
	return query("UPDATE criterion SET " + balls + " WHERE name_kpi='" + criterion.name_kpi + 
		"' AND number_criterion=" + criterion.number_criterion);
}