const xl = require("excel4node");

//функции работы с БД
let DBs = require('../modules/db/select.js');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let getObjPeriod = require('../modules/period.js').getObjPeriod;
let dateModule = require('../modules/date.js');

//страница ПФУ для создания отчета
exports.pagePfu = function(req, res) {
    let objPeriod = getObjPeriod();
    res.render('page-pfu', {set: objPeriod.set, period: objPeriod,
        infoUser: req.session, pageName: '/pfu'});
};

//создание отчета
exports.getReport = function(req, res) {
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

    let objPeriod = getObjPeriod();
    let date1 = new Date(objPeriod.date1);
    let date2 = new Date(objPeriod.date2);


    DBs.forReportPFU(dateModule.dateForInput(date1), dateModule.dateForInput(date2)).then(userValues => {
        console.log(userValues[0]);
        console.log(userValues[1]);
        console.log(userValues[2]);
        console.log(userValues[3]);
        console.log(userValues[4]);
        console.log(')))))))');
        DBs.selectKpiAndUser().then(kpi => {
            console.log(kpi[0]);
            console.log(kpi[1]);
            console.log(kpi[2]);
            console.log(kpi[3]);
            console.log(kpi[4]);
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
                let login = kpi[i].login;
                //let finalCriterion = i + kpi[i].count_criterion;
                if(kpi[i].name_kpi == 'Н.П.2' && numUserValue != userValues.length) {
                    //console.log('????????????????');
                    //console.log(userValues[numUserValue]);
                    //console.log(kpi[i]);
                }
                if(numUserValue == userValues.length || userValues[numUserValue].login != kpi[i].login ||
                    userValues[numUserValue].name_kpi != kpi[i].name_kpi) {
                    i+= kpi[i].count_criterion;
                }
                else {
                    //пока значение данного ПЭД есть у пользователя
                    while(numUserValue != userValues.length && user == userValues[numUserValue].login &&
                    userValues[numUserValue].login == kpi[i].login
                    && userValues[numUserValue].name_kpi == kpi[i].name_kpi && nameKpi == kpi[i].name_kpi) {
                        if(kpi[i].name_kpi == 'Н.П.2') {
                            console.log('=------------');
                            //console.log('kpi', kpi[i].name_kpi);
                            console.log('kpi count crit', kpi[i].count_criterion);
                            console.log('user', kpi[i].login);
                            //console.log('=------------');
                        }

                        if(kpi[i].type == 1 || userValues[numUserValue].number_criterion == kpi[i].number_criterion) {
                            let value = getValue(userValues[numUserValue]);
                            if(kpi[i].name_kpi == 'Н.П.2') {
                                console.log('VALUE', value);
                                console.log(kpi[i].start_val);
                                console.log(kpi[i].final_val);
                            }
                            if(value >= kpi[i].start_val && (kpi[i].final_val == null || value <= kpi[i].final_val)) {
                                val += kpi[i].ball;
                                if(kpi[i].name_kpi == 'Н.П.2') {
                                    console.log(val, kpi[i].ball);
                                }
                            }
                        }
                        if(kpi[i].name_kpi == 'Н.П.2') {
                            console.log('num cr', kpi[i].number_criterion);
                            console.log('jjjjjj', numUserValue);
                        }
                        if((/*kpi[i].type == 1 && */kpi[i].number_criterion == kpi[i].count_criterion - 1) ||
                            (kpi[i].type == 2 && userValues[numUserValue].number_criterion == kpi[i].number_criterion)) {
                            numUserValue ++;
                        }
                        if(kpi[i].name_kpi == 'Н.П.2') {
                            console.log('jjjjjj', numUserValue);
                        }
                        i++;
                    }
                    //i = finalCriterion;
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
            writeLogs(req.session.login, req.session.position, "создал(а) отчет");

            wb.write(objPeriod.date1.split("-").reverse().join('_') + '-' +
                objPeriod.date2.split("-").reverse().join('_') + '.xlsx', res);
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.status(500).render('error/500');
        });
    }).catch(err => {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
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