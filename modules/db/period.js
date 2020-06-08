const query = require('./connect-db');

//INSERT

//добавление нового актуального периода
exports.insertActualPeriod = function(date1, date2, periodName) {
    return query("INSERT INTO period (start_date, finish_date, actual, name_period) " +
        "VALUES (?, ?, 1, ?)",
        [date1, date2, periodName]);
};

//добавление нового неактуального периода
exports.insertNotActualPeriod = function(date1, date2, periodName) {
    return query("INSERT INTO period (start_date, finish_date, actual, name_period) " +
        "VALUES (?, ?, 0, ?)",
        [date1, date2, periodName]);
};

//SELECT

//получить актуальный период
exports.selectActualPeriod = function() {
    return query("SELECT * FROM period WHERE actual=1");
};

//UPDATE

//делаем все периоды неактуальными
exports.updatePeriodSetNotActual = function() {
    return query("UPDATE period SET actual=0 WHERE actual=1");
};

//DELETE

//удаляем все периоды
exports.deleteAllPeriods = function() {
    return query("DELETE FROM period");
};
