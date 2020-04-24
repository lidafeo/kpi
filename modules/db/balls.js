const query = require('./connect-db');

//SELECT

//проверка баллов конкретного ПЭД
exports.selectBallOneKpi = function(nameKpi, position) {
    return query("SELECT * FROM kpi " +
        "INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
        "INNER JOIN balls ON balls.id_criterion=criterions.id " +
        "WHERE kpi.name=? AND balls.position=? " +
        "ORDER BY id ASC",
        [nameKpi, position]);
};

//получить баллы конкретного критерия
exports.selectBallOneCriterion = function(idCriterion) {
    return query("SELECT * FROM balls " +
        "INNER JOIN positions ON positions.position = balls.position " +
        "WHERE id_criterion=? " +
        "ORDER BY positions.sort",
        [idCriterion]);
};

//BALLS
/*
//добавляем баллы
exports.updateBalls = function(ball) {
    return query("UPDATE balls SET ball=" + ball.ball + " WHERE id_criterion=" + ball.id_criterion +
        " AND position=" + ball.position);
};
 */

//изменяем оценки ПЭД
exports.updateBallOfCriterion = function(ball) {
    return query("UPDATE balls SET ball=" + ball[2] + " WHERE id_criterion=" + ball[0] +
        " AND position='" + ball[1] + "'");
};