const query = require('../connectdb');

//USERVALUE

//помечаем недействительный ПЭД
exports.updateValueInvalid = function(id, author, text) {
	return query("UPDATE uservalues SET author_verify='" + author + "', text_verify='" + text + 
		"', valid=0 WHERE id=" + id);
};

//отменяем недействительный ПЭД
exports.updateValueCancelInvalid = function(id) {
	return query("UPDATE uservalues SET author_verify=NULL, text_verify=NULL, valid=1 " +
		"WHERE id=?", [id]);
};

//USER

//меняем пароль пользователю
exports.updatePassword = function(login, newPassword) {
	return query("UPDATE users SET password='" + newPassword +
		"' WHERE login=?", [login]);
};

//CRITERION

//изменяем оценки ПЭД
exports.updateBallOfCriterion = function(ball) {
	return query("UPDATE balls SET ball=" + ball[2] + " WHERE id_criterion=" + ball[0] + 
		" AND position='" + ball[1] + "'");
};


//BALLS

//добавляем баллы
exports.updateBalls = function(ball) {
	return query("UPDATE balls SET ball=" + ball.ball + " WHERE id_criterion=" + ball.id_criterion + 
	" AND position=" + ball.position);
};