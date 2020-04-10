const fs = require("fs");

let dateModule = require('../modules/date.js');
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//GET-запрос страницы просмотра действий пользователей
exports.pageGetActionsUsers = function(req, res) {
    let date;
    if(req.query.date)
        date = new Date(req.query.date);
    else
        date = new Date();
    let strDate = dateModule.dateToString(date);
    let dateHTML = dateModule.dateForInput(date);
    let nameFile = strDate.split('.').join('_') + '.log';
    fs.readFile("./log/worker/" + nameFile, "utf8", function(err, data) {
        let logs = [];
        if(err) {
            console.log(strDate + " не было действий пользователей");
            logs.push("Действий пользователей не было");
        }
        else {
            logs = data.split(';');
        }
        if(req.body) {
            res.render('page-get-actions-users', {logs: logs, date: dateHTML,
                infoUser: req.session, pageName: '/get-actions-users'});
        }
        else {
            res.render('page-get-actions-users', {logs: logs, date: dateHTML,
                infoUser: req.session, pageName: '/get-actions-users'});
        }
    });
};