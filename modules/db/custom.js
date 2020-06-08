const query = require('./connect-db');

//для отчета ПФУ
exports.forReportPFU = function(date1, date2) {

    return query("SELECT UV.name_kpi name_kpi, users.name name_user, login, COUNT(DISTINCT id) cou, value, type, " +
        "indicator_sum, number_criterion, " +
        "substring_index(group_concat(value order by date desc, id desc), ',', 1) as value_max_date " +
        "FROM user_values UV " +
        "INNER JOIN kpi ON kpi.name=UV.name_kpi " +
        "INNER JOIN users ON  users.login=UV.login_user "+
        "WHERE ((start_date BETWEEN DATE(?) AND DATE(?)) OR (finish_date BETWEEN DATE(?) AND DATE(?)) OR " +
        "((start_date <= DATE(?)) AND (finish_date >= DATE(?)))) AND valid=1 " +
        "GROUP BY name_kpi, login, number_criterion " +
        "ORDER BY name_user ASC, users.login ASC, section ASC, subtype ASC, number ASC, number_criterion ASC",
        [date1, date2, date1, date2, date1, date2]);
};

//тоже для отчета ПФУ
exports.selectKpiAndUser = function() {
    return query("SELECT kpi.name name_kpi, users.name name_user, type, users.position, count_criterion, login, " +
        "faculty, department, indicator_sum, start_val, final_val, mark, number_criterion " +
        "FROM users, kpi, positions, criterions, marks " +
        "WHERE positions.position=users.position AND " +
        "criterions.name_kpi=kpi.name AND marks.position=positions.position AND " +
        "marks.id_criterion=criterions.id " +
        "ORDER BY users.name ASC, users.login ASC, section ASC, subtype ASC, number ASC, number_criterion ASC");
};