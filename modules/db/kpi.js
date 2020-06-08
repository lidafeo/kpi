const query = require('./connect-db');

//добавление kpi
exports.insertKpi = function(newKpi) {
    let arr = [newKpi.name, newKpi.section, newKpi.subtype, newKpi.number,
        newKpi.count_criterion, newKpi.description, newKpi.type, newKpi.indicator_sum,
        newKpi.action_time];
    return query("INSERT INTO kpi VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", arr);
};

//удаление ПЭД
exports.deleteKpi = function(name) {
    return query("DELETE FROM kpi WHERE name=?", [name]);
};

//удаление всех ПЭД
exports.deleteAllKpi = function() {
    return query("DELETE FROM kpi");
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
        "INNER JOIN marks ON marks.id_criterion=criterions.id " +
        "INNER JOIN positions ON positions.position=marks.position " +
        "ORDER BY section ASC, subtype ASC, number ASC, name ASC, id_criterion ASC, " +
        "positions.sort ASC, marks.position ASC");
};

//получить один ПЭД
exports.selectOneKpi = function(name) {
    return query("SELECT * FROM kpi " +
        "WHERE kpi.name=?",
        [name]);
};
/*
//получить один ПЭД с баллами
exports.selectOneKpiWithMarks = function(name) {
    return query("SELECT * FROM kpi " +
        "INNER JOIN criterions ON criterions.name_kpi=kpi.name " +
        "INNER JOIN marks ON marks.id_criterion=criterions.id " +
        "INNER JOIN positions ON positions.position=marks.position "+
        "WHERE kpi.name=? " +
        "ORDER BY id_criterion ASC, positions.sort ASC, marks.position ASC",
        [name]);
};
 */

//получить разделы
exports.selectAllSection = function() {
    return query("SELECT DISTINCT section FROM kpi");
};