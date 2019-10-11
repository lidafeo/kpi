const xl = require("excel4node");

let wb = new xl.Workbook();
let style = wb.createStyle({
	font: {
		color: '#000000',
		size: 12
	},
	numberFormat: '#0; (#); -'
});

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
	let ws = wb.addWorksheet('Sheet1');

	ws.cell(1, 1).string('ФИО').style(style).style({font:{bold: true}});
	ws.cell(1, 2).string('Факультет').style(style).style({font:{bold: true}});
	ws.cell(1, 3).string('Кафедра').style(style).style({font:{bold: true}});

	let objPeriod = getObjPeriod();
	let date1 = new Date(objPeriod.date1);
	let date2 = new Date(objPeriod.date2);


	DBs.forReportPFU(dateModule.dateForInput(date1), dateModule.dateForInput(date2)).then(uservalue => {
		DBs.selectKpiAndUser().then(kpi => {
			let userone = kpi[0].login;
			let countKpi = 0;
			let numUservalue = 0;
			let user;
			let n = 0, m = 0;
			let sum = 0;
			for(let i = 0; i < kpi.length; i++) {
				//заполение первой строчки с названиями ПЭД
				if(userone == kpi[i].login) {
					ws.cell(1, 4 + i).string(kpi[i].name_kpi).style(style).style({font:{bold: true}});
					countKpi++;
				}
				if (user != kpi[i].login) {
					user = kpi[i].login;
					n++;
					ws.cell(n + 1, 1).string(kpi[i].name_user).style(style);
					ws.cell(n + 1, 2).string(kpi[i].faculty).style(style);
					ws.cell(n + 1, 3).string(kpi[i].department).style(style);
					ws.cell(n, 4 + m).number(sum).style(style);
					m = 0;
					sum = 0;
				}
				let ball = 0;
				let objProp = {};

				//копирование свойств
				objProp.name = kpi[i].name_kpi;
				objProp.type = kpi[i].type;
				objProp.indicatorsSumm = kpi[i].indicator_sum;
				objProp.countCriterion = kpi[i].count_criterion;


				//пока значение данного ПЭД есть у пользователя
				while(numUservalue != uservalue.length && uservalue[numUservalue].name_user == kpi[i].name_user 
					&& uservalue[numUservalue].name_kpi == kpi[i].name_kpi) {

					objProp.numberCriterion = uservalue[numUservalue].number_criterion;
					let balls = [];
					for(let j = 0; j < 6; j++)
						balls.push(uservalue[numUservalue][('ball_' + j)]);
					objProp.balls = balls;

					getProp(uservalue[numUservalue], objProp);
					numUservalue ++;
				}
				if(objProp.ball) {
					let arr = calculateBall(objProp, kpi[i].number_group);
					for(let j = 0; j < arr.length; j++)
						ball += arr[j];
				}
				ws.cell(n + 1, 4 + m).number(ball).style(style);
				sum += ball;
				m++;
			}
			ws.cell(n + 1, 4 + m).number(sum).style(style)
			ws.cell(1, 4 + countKpi).string('Сумма').style(style).style({font:{bold: true}});
			ws.column(1).setWidth(50);

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


//вычисление оценки
function calculateBall(kpi, positionNumber) {
	let value;
	let ball = [];
	//ставим оценку ПЭДу первого типа
	if(kpi.type == 1) {
		//находим балл
		value = getBall (kpi);
		ball[0] = value;
	}
	//ставим оценку ПЭДу второго типа
	else {
		for(let i = 0; i < kpi.countCriterion; i++) {
			value = getBall(kpi, i);
			ball.push(value);
		}
	}
	return ball;
}

//функция вычисления балла
function getBall (kpi, k) {
	let value = 0;
	if(kpi.indicatorsSumm) {
		if(kpi.type == 1) value = kpi.count;
		else value = kpi.count[k];
	}
	else {
		let date = new Date(0);	
		let count = kpi.count;
		if(kpi.type == 2) count = kpi.count[k];
		for(let i = 0; i < count; i++) {
			if(kpi.type == 1 && kpi.date[i] > date) {
				value = kpi.ball[i];
				date = kpi.date[i];
			}
			if(kpi.type == 2 && kpi.date[k][i] > date) {
				value = kpi.ball[k][i];
				date = kpi.date[k][i];
			}
		}
	}
	return value;
}

function getProp (uservalue, info) {
	if(uservalue.type == 1) {
		if(info.count) info.count++;
		else {
			info.count = 1;
			info.ball = [];
			//info.value = [];
			info.date = [];
		}
		info.ball.push(info.balls[uservalue.number_group]);
		info.date.push(uservalue.date);
	}
	else {
		if(!info.count) {
			info.count = [];
			info.ball = [];
			info.date = [];
			info.num = [];
			//info.value = [];

			for(let k = 0; k < uservalue.count_criterion; k++) {
				info.count[k] = 0;
				info.ball[k] = [];
				info.date[k] = [];
			}
		}
		info.count[uservalue.number_criterion] ++;
		info.num.push(uservalue.number_criterion);
		info.ball[uservalue.number_criterion].push(info.balls[uservalue.number_group]);
		info.date[uservalue.number_criterion].push(uservalue.date);
	}
	//info.value.push(uservalue.value);
}