//получение массива оценок объекта одного ПЭД
exports.getKpiObj = function(arr, positions) {
    if(!positions)
        positions = [];
    let kpi = {};
    for (key in arr[0]) {
        if(key != 'ball' && key !='positions')
            kpi[key] = arr[0][key];
    }
    let lines = [];
    for(let i = 0; i < arr.length; i++) {
        let idCrit = arr[i].id;
        let criterion = arr[i].name_criterion;
        let desc = arr[i].criterion_description;
        let balls = [];
        while (i != arr.length && idCrit == arr[i].id) {
            if(positions.indexOf(arr[i].position) == -1)
                positions.push(arr[i].position);
            balls[arr[i].position] = arr[i].ball;
            i++;
        }
        lines.push({name: criterion, description: desc, balls: balls, id: idCrit});
        i--;
    }
    kpi.lines = lines;
    kpi.positions = positions;
    return kpi;
};
//сортировка названий ПЭДов
exports.sortArr = function (a, b) {
    if(a.section > b.section) return 1;
    if(a.section < b.section) return -1;
    if(a.subtype > b.subtype) return 1;
    if(a.subtype < b.subtype) return -1;
    return (a.number - b.number);
};

//сортировка и
//добавление доп информации по ПЭДам: количество подтвержденных, балл, дата подтверждения
exports.sortKpi = function (userValue, info, criterion) {
    //копирование свойств
    info.description = userValue.description;
    info.name = userValue.name;
    info.type = userValue.type;
    info.indicatorSum = userValue.indicator_sum;
    info.section = userValue.section;
    info.subtype = userValue.subtype;
    info.number = userValue.number;
    info.countCriterion = userValue.count_criterion;
    info.criterion = criterion;

    if(userValue.type == 1) {
        if(info.count) info.count++;
        else {
            info.count = 1;
            info.val = [];
            info.date = [];
        }
    }
    else {
        if(!info.count) {
            info.count = [];
            info.val = [];
            info.date = [];
            info.num = [];
            for(let k = 0; k < userValue.count_criterion; k++)
                info.count[k] = 0;
        }
        info.count[userValue.number_criterion] ++;
    }
    info.val.push(userValue.value);
    info.date.push(userValue.date);
    if (userValue.type == 2) {
        info.num.push(userValue.number_criterion);
    }
};