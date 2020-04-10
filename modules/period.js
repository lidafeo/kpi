const fs = require("fs");
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
    return JSON.parse(readPeriod());
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
exports.setDate = function (date1, date2) {
    let period = JSON.parse(readPeriod());
    setDate(period, date1, date2);
    writePeriod(period);
};
exports.deletePeriod = function () {
    let period = JSON.parse(readPeriod());
    period.set = false;
    period.notify = false;
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