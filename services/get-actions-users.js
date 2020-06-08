const fs = require("fs");

let dateModule = require('../modules/date.js');
let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//запрос страницы просмотра действий пользователей
exports.pageGetActionsUsers = async function(user, queryDate, func) {
    let date;
    if(queryDate)
        date = new Date(queryDate);
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
        } else {
            logs = data.split(';');
        }
        func({logs: logs, date: dateHTML, infoUser: user, pageName: '/get-actions-users'});
    });
};