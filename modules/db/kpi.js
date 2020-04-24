const query = require('./connect-db');

//добавление kpi
exports.insertKpi = function(name, section, subtype, number, count_criterion, description, type,
                             indicator_sum, action_time) {
    let arr = [name, section, subtype, number, count_criterion, description, type, indicator_sum, action_time];
    return query("INSERT INTO kpi VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};

//удаление ПЭД
exports.deleteKpi = function(name) {
    return query("DELETE FROM kpi WHERE name=?", [name]);
};

//получить все ПЭД
exports.selectAllKpi = function() {
    return query("SELECT * FROM kpi " +
        "ORDER BY section ASC, subtype ASC, number ASC");
};

//получить все ПЭД с критериями
exports.selectAllKpiWithCriterion = function() {
    return query("SELECT * FROM kpi " +
        "INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
        "INNER JOIN balls ON balls.id_criterion=criterions.id " +
        "INNER JOIN positions ON positions.position=balls.position " +
        "ORDER BY section ASC, subtype ASC, number ASC, name ASC, id_criterion ASC, " +
        "positions.sort ASC, balls.position ASC");
};

//получить один ПЭД
exports.selectOneKpi = function(name) {
    return query("SELECT * FROM kpi " +
        "WHERE kpi.name=?",
        [name]);
};
/*
//получить один ПЭД с баллами
exports.selectOneKpiWithBalls = function(name) {
    return query("SELECT * FROM kpi " +
        "INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
        "INNER JOIN balls ON balls.id_criterion=criterions.id " +
        "INNER JOIN positions ON positions.position=balls.position "+
        "WHERE kpi.name=? " +
        "ORDER BY id_criterion ASC, positions.sort ASC, balls.position ASC",
        [name]);
};
 */

//получить разделы
exports.selectAllSection = function() {
    return query("SELECT DISTINCT section FROM kpi");
};