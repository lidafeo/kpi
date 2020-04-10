module.exports = {
    //вычисление оценки
    calculateBall: function (kpi, criterion) {
        let value;
        let ball = [];
        //ставим оценку ПЭДу первого типа
        if(kpi.type == 1) {
            //находим балл
            value = getBall (kpi);
            //вычисляем оценку
            for(let i = 0; i < criterion.length; i++) {
                if(!criterion[i].finalVal) criterion[i].finalVal = Infinity;
                if(value >= criterion[i].startVal && value <= criterion[i].finalVal) {
                    ball[0] = criterion[i].ball;
                }
                else if(!ball[0]) ball[0] = 0;
            }
        }
        //ставим оценку ПЭДу второго типа
        else {
            //находим и вычисляем оценку для каждой подстроки
            for(let i = 0; i < criterion.length; i++) {
                value = getBall(kpi, i);
                if(!criterion[i].finalVal) criterion[i].finalVal = Infinity;
                if(value >= criterion[i].startVal && value <= criterion[i].finalVal) {
                    if(kpi.num.indexOf(i) != -1) {
                        ball.push(criterion[i].ball);
                    }
                    else ball.push(0);
                }
                else ball.push(0);
            }
        }
        return ball;
    },
    //преобразование даты к нормальному виду
    modifyDateOfValue: function (arrObj) {
        for(let i = 0; i < arrObj.length; i++) {
            modifyOneDate(arrObj[i], 'date');
            if(arrObj[i]['start_date'])
                modifyOneDate(arrObj[i], 'start_date');
        }
    }
};

function modifyOneDate (obj, prop) {
    let date = obj[prop];
    let objDate = date.getDate();
    let objMonth = date.getMonth() + 1;
    let objYear = date.getFullYear();
    if(objDate < 10) objDate = "0" + objDate;
    if(objMonth < 10) objMonth = "0" + objMonth;
    obj['modify' + prop] = objDate + '.' + objMonth + '.' + objYear;
}

//функция вычисления балла
function getBall (kpi, k) {
    let value = 0;
    if(kpi.indicatorSum) {
        if(kpi.type == 1) value = kpi.count;
        else value = kpi.count[k];
    }
    else {
        let date = new Date(0);
        for(let i = 0; i < kpi.count; i++) {
            if(kpi.type == 1 || kpi.type == 2 && kpi.num[i] == k)
                if(kpi.date[i] > date) {
                    value = kpi.val[i];
                    date = kpi.date[i];
                }
        }
    }
    return value;
}