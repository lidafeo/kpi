const query = require('./connect-db');

//SELECT

//проверка баллов конкретного ПЭД
exports.selectMarkOneKpi = function(nameKpi, position) {
    return query("SELECT * FROM kpi " +
        "INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
        "INNER JOIN marks ON marks.id_criterion=criterions.id " +
        "WHERE kpi.name=? AND marks.position=? " +
        "ORDER BY id ASC",
        [nameKpi, position]);
};

//получить баллы конкретного критерия
exports.selectMarkOneCriterion = function(idCriterion) {
    return query("SELECT * FROM marks " +
        "INNER JOIN positions ON positions.position = marks.position " +
        "WHERE id_criterion=? " +
        "ORDER BY positions.sort",
        [idCriterion]);
};

//MARKS
/*
//добавляем баллы
exports.updateMarks = function(mark) {
    return query("UPDATE marks SET mark=" + mark.mark + " WHERE id_criterion=" + mark.id_criterion +
        " AND position=" + mark.position);
};
 */

//изменяем оценки ПЭД
exports.updateMarkOfCriterion = function(mark) {
    return query("UPDATE marks SET mark=" + mark[2] + " WHERE id_criterion=" + mark[0] +
        " AND position='" + mark[1] + "'");
};