module.exports = {
    //вычисление оценки
    calculateMark: function (kpi, criterion) {
        let value;
        let mark = [];
        //ставим оценку ПЭДу первого типа
        if(kpi.type == 1) {
            //находим балл
            value = getMark (kpi);
            //вычисляем оценку
            for(let i = 0; i < criterion.length; i++) {
                if(!criterion[i].finalVal) criterion[i].finalVal = Infinity;
                if(value >= criterion[i].startVal && value <= criterion[i].finalVal) {
                    mark[0] = criterion[i].mark;
                }
                else if(!mark[0]) mark[0] = 0;
            }
        }
        //ставим оценку ПЭДу второго типа
        else {
            //находим и вычисляем оценку для каждой подстроки
            for(let i = 0; i < criterion.length; i++) {
                value = getMark(kpi, i);
                if(!criterion[i].finalVal) criterion[i].finalVal = Infinity;
                if(value >= criterion[i].startVal && value <= criterion[i].finalVal) {
                    if(kpi.num.indexOf(i) != -1) {
                        mark.push(criterion[i].mark);
                    }
                    else mark.push(0);
                }
                else mark.push(0);
            }
        }
        return mark;
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
function getMark (kpi, k) {
    let value = 0;
    if(kpi.indicatorSum) {
        if(kpi.type == 1) value = kpi.count;
        else value = kpi.count[k];
    }
    else {
        let date = new Date(0);
        if(kpi.type == 1) {
            for (let i = 0; i < kpi.count; i++) {
                if (kpi.date[i] > date) {
                    value = kpi.val[i];
                    date = kpi.date[i];
                }
            }
        } else {
            for (let i = 0; i < kpi.count[k]; i++) {
                if (kpi.type == 2 && kpi.num[i] == k) {
                    if (kpi.date[i] > date) {
                        value = kpi.val[i];
                        date = kpi.date[i];
                    }
                }
            }
        }
    }
    return value;
}