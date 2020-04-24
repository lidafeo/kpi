const query = require('./connect-db');

//выбрать все права
exports.selectAllRights = function() {
    return query("SELECT * from rights");
};