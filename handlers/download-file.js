let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//отправка файла пользователю
exports.downloadFile = function(req, res) {
    let file = req.query.file;
    res.download("./user_files/" + file, file);
};