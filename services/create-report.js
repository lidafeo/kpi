const xl = require("excel4node");

let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let getObjPeriod = require('../modules/period.js').getObjPeriod;
let dateModule = require('../modules/date.js');

//страница ПФУ для создания отчета
exports.pagePfu = async function(user) {
    let objPeriod = await getObjPeriod();
    let period = null;
    if(objPeriod && objPeriod.length > 0) {
        period = objPeriod[0];
        period.date1 = dateModule.dateForOut(period.start_date);
        period.date2 = dateModule.dateForOut(period.finish_date);
    }
    return {period: period, infoUser: user, pageName: '/pfu'};
};

//создание отчета
exports.getReport = async function(userPfu, res) {
    let wb = new xl.Workbook();
    let style = wb.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        numberFormat: '#0; (#); -'
    });

    let ws = wb.addWorksheet('Sheet1');

    ws.cell(1, 1).string('ФИО').style(style).style({font:{bold: true}});
    ws.cell(1, 2).string('Факультет').style(style).style({font:{bold: true}});
    ws.cell(1, 3).string('Кафедра').style(style).style({font:{bold: true}});
    ws.cell(1, 4).string('Должность').style(style).style({font:{bold: true}});

    let objPeriod = await getObjPeriod();
    let period = null;
    if(objPeriod && objPeriod.length > 0) {
        period = objPeriod[0];
        period.date1 = dateModule.dateForOut(period.start_date);
        period.date2 = dateModule.dateForOut(period.finish_date);
    }
    let userValues = await DB.custom.forReportPFU(dateModule.dateForInput(period.start_date), dateModule.dateForInput(period.finish_date));
    let kpi = await DB.custom.selectKpiAndUser();
    let firstUser = kpi[0].login;
    let countKpi = 0;
    let numUserValue = 0;
    let user;
    let n = 1, m = 5;
    let sum = 0;
    for(let i = 0; i < kpi.length; i++) {
        //заполение первой строчки с названиями ПЭД
        if(firstUser == kpi[i].login) {
            ws.cell(1, m).string(kpi[i].name_kpi).style(style).style({font:{bold: true}});
            countKpi++;
        }
        if (user != kpi[i].login) {
            user = kpi[i].login;
            n++;
            ws.cell(n, 1).string(kpi[i].name_user).style(style);
            ws.cell(n, 2).string(kpi[i].faculty).style(style);
            ws.cell(n, 3).string(kpi[i].department).style(style);
            ws.cell(n, 4).string(kpi[i].position).style(style);
            if(i != 0)
                ws.cell(n - 1, m).number(sum).style(style);
            m = 5;
            sum = 0;
        }
        let val = 0;
        let nameKpi = kpi[i].name_kpi;
        //let login = kpi[i].login;
        let finalCriterion = i + kpi[i].count_criterion;
        if(numUserValue == userValues.length || userValues[numUserValue].login != kpi[i].login ||
            userValues[numUserValue].name_kpi != kpi[i].name_kpi) {
            i+= kpi[i].count_criterion;
        }
        else {
            //пока значение данного ПЭД есть у пользователя
            while(numUserValue != userValues.length && user == userValues[numUserValue].login &&
            userValues[numUserValue].login == kpi[i].login && userValues[numUserValue].name_kpi == kpi[i].name_kpi
            && nameKpi == kpi[i].name_kpi) {

                if(kpi[i].type == 1 || userValues[numUserValue].number_criterion == kpi[i].number_criterion) {
                    let value = getValue(userValues[numUserValue]);
                    if(value >= kpi[i].start_val && (kpi[i].final_val == null || value <= kpi[i].final_val)) {
                        val += kpi[i].mark;
                    }
                }
                if((/*kpi[i].type == 1 && */kpi[i].number_criterion == kpi[i].count_criterion - 1) ||
                    (kpi[i].type == 2 && userValues[numUserValue].number_criterion == kpi[i].number_criterion)) {
                    numUserValue ++;
                }
                i++;
            }
            i = finalCriterion;
        }
        //numUserValue --;
        i --;
        ws.cell(n, m).number(val).style(style);
        m++;
        sum += val;
    }
    ws.cell(n, m).number(sum).style(style);
    ws.cell(1, 5 + countKpi).string('Сумма').style(style).style({font:{bold: true}});
    ws.column(1).setWidth(35);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(42);
    ws.column(4).setWidth(20);

    //записываем логи
    writeLogs(userPfu.login, userPfu.position, "создал(а) отчет");

    wb.write(period.date1.split("-").reverse().join('_') + '-' +
        period.date2.split("-").reverse().join('_') + '.xlsx', res);
};

function getValue (uv) {
    let value;
    if(uv.indicator_sum == 0) {
        value = +uv.value_max_date;
    }
    else {
        value = +uv.cou;
    }
    return value;
}