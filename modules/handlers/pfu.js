const xl = require("excel4node");

//функции работы с БД
let DBs = require('../db/select.js');

let getObjPeriod = require('./admin.js').getObjPeriod;
let dateModule = require('../date.js');

//главная страница ПФУ
exports.pfu = function(req, res) {
	let objPeriod = getObjPeriod();
	res.render('pfu', {setbool: objPeriod.setbool, period: objPeriod});
}

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


	DBs.forReportPFU(dateModule.dateForInput(date1), dateModule.dateForInput(date2)).then(uservalue => {
		DBs.selectKpiAndUser().then(kpi => {
			let userone = kpi[0].login;
			let countKpi = 0;
			let numUservalue = 0;
			let user;
			let n = 1, m = 5;
			let sum = 0;
			for(let i = 0; i < kpi.length; i++) {
				
				//заполение первой строчки с названиями ПЭД
				if(userone == kpi[i].login) {
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
				let finalCrit = i + kpi[i].count_criterion;
				if(numUservalue == uservalue.length || uservalue[numUservalue].login != kpi[i].login || 
					uservalue[numUservalue].name_kpi != kpi[i].name_kpi) {
					i+= kpi[i].count_criterion;
				}
				else {
					//пока значение данного ПЭД есть у пользователя
					while(numUservalue != uservalue.length && user == uservalue[numUservalue].login && 
						uservalue[numUservalue].login == kpi[i].login 
						&& uservalue[numUservalue].name_kpi == kpi[i].name_kpi) {

						if(kpi[i].type == 1 || uservalue[numUservalue].number_criterion == kpi[i].number_criterion) {
							let value = getValue(uservalue[numUservalue]);
							if(value >= kpi[i].start_val && (kpi[i].final_val == null || value <= kpi[i].final_val)) {
								val += kpi[i].ball;
							}
							numUservalue ++;
						}
						i++;

					}
					i = finalCrit;
				}
				i --;
				ws.cell(n, m).number(val).style(style);
				m++;
				sum += val;
			}
			ws.cell(n, m).number(sum).style(style)
			ws.cell(1, 5 + countKpi).string('Сумма').style(style).style({font:{bold: true}});

			ws.column(1).setWidth(35);
			ws.column(2).setWidth(30);
			ws.column(3).setWidth(42);
			ws.column(4).setWidth(20);

			wb.write(objPeriod.date1.split("-").reverse().join('_') + '-' + 
					objPeriod.date2.split("-").reverse().join('_') + '.xlsx', res);
		}).catch(err => {
			console.log(err);
			res.status(500).render('500');
		});
	}).catch(err => {
		console.log(err);
		res.status(500).render('500');
	});
}


function getValue (uv) {
	let value;
	if(uv.indicator_sum == 0) {
		value = +uv.valuemaxdate;
	}
	else {
		value = +uv.cou;
	}
	return value;
}