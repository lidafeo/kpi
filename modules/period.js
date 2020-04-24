const fs = require("fs");

let dateModule = require('./date.js');
let DB = require('./db');

//let period = require('./config/period.json');
/*
//текущий период отчета
let objPeriod = {
    set: false,
    notify: false,
    deletePeriod: function() {
        this.set = false;
    },

};
//доступ к личным кабинетам
let objClose = false;

 */

exports.getObjPeriod = function () {
    return DB.period.selectActualPeriod();
    //return JSON.parse(readPeriod());
};

exports.getPeriod = function() {
    return DB.period.selectActualPeriod().then(objPeriod => {
        let period = {};
        let date1, date2;
        //Если период отчета не задан, устанавливаем
        if (!objPeriod || objPeriod.length == 0) {
            let dt1 = new Date();
            let dt2 = new Date();
            dt1.setMonth(dt1.getMonth() - 6);
            date1 = dateModule.dateForInput(dt1);
            date2 = dateModule.dateForInput(dt2);
        } else {
            period = objPeriod[0];
            date1 = dateModule.dateForInput(objPeriod[0].start_date);
            date2 = dateModule.dateForInput(objPeriod[0].finish_date);
        }
        period.d1 = new Date(date1);
        period.d2 = new Date(date2);
        period.date1 = date1;
        period.date2 = date2;
        return period;
    });
};
exports.createActualPeriod = async function (date1, date2, periodName) {
    //let period = JSON.parse(readPeriod());
    //setDate(period, date1, date2);
    //writePeriod(period);
    let resultUpdate = await DB.period.updatePeriodSetNotActual();
    let startDate = new Date(date1);
    let finishDate = new Date(date2);
    let resultInsert = DB.period.insertActualPeriod(startDate, finishDate, periodName);
    return resultInsert;
};
exports.deletePeriod = function () {
    let period = JSON.parse(readPeriod());
    period.set = false;
    period.notify = false;
    writePeriod(period);
};

exports.setNotify = function (notify) {
    //fs.writeFile("./config/period.json", JSON.stringify({faculty: fac, department: dep}), err => {
    //   console.log(err);
    //});
    let period = JSON.parse(readPeriod());
    period.notify = notify;
    writePeriod(period);
};

exports.setClose = function (close) {
    let period = JSON.parse(readPeriod());
    period.close = close;
    writePeriod(period);
};

exports.getObjClose = function () {
    return JSON.parse(readPeriod()).close;
};

function readPeriod() {
    let period = fs.readFileSync("./config/period.json", "utf8");
    return period;
}
function writePeriod(period) {
    fs.writeFileSync("./config/period.json", JSON.stringify(period));
}
function setDate(period, date1, date2) {
    period.date1 = date1;
    period.date2 = date2;
    let date_1 = new Date(date1);
    let date_2 = new Date(date2);
    period.date1Str = (date_1.getDate() < 10 ? '0' + date_1.getDate() : date_1.getDate()) + "."
        + ((date_1.getMonth() + 1) < 10 ? '0' + (date_1.getMonth() + 1) : (date_1.getMonth() + 1))
        + '.' + date_1.getFullYear();
    period.date2Str = (date_2.getDate() < 10 ? '0' + date_2.getDate() : date_2.getDate()) + "."
        + ((date_2.getMonth() + 1) < 10 ? '0' + (date_2.getMonth() + 1) : (date_2.getMonth() + 1))
        + '.' + date_2.getFullYear();
    period.set = true;
}