const query = require('./connect-db');

//выбрать одну должность
exports.selectOnePosition = function(position) {
    return query("SELECT position, level FROM positions " +
        "WHERE position=?", position);
};

//выбрать должность используя LIKE
exports.selectOnePositionWithLike = function(position) {
    return query("SELECT position, level FROM positions " +
        "WHERE position=? OR position LIKE '%" + position + "%'", position);
};

//выбрать все должности
exports.selectPositions = function() {
    return query("SELECT position, level FROM positions " +
        "ORDER BY sort ASC, position ASC");
};
