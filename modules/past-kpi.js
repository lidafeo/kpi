let DB = require('./db');

let colunms = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
    'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH',
    'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ'];

let namesKpi = [];

module.exports = {
    main: async function(workSheet) {
        let num = 1;
        let countError = 0;
        let countIgnore = 0;
        //addNames = []; addUsers = [];
        allNames = []; allUsers = [];
        let errParse = await getNamesKpiFromFile(workSheet);
        console.log("Parse names kpi", errParse);

        //currUser = {};
        while (true) {
            let obj = {};
            //порядковый номер
            obj.numb = num;
            //имя
            let name = (workSheet["A" + (num + 1)] ? (workSheet["A" + (num + 1)].v + "") : undefined);
            if(!name) {
                break;
            }
            // ищем пользователя в БД
            let user = await DB.users.selectOneUserByName(name);
            obj.name = name;

            if(!user[0]) {
                obj.error = "Пользоватeль не найден в БД";
                countError ++;
                console.log("added", num);
                num ++;
                allUsers.push(obj);
                continue;
            }

            try {
                //парсим значения ПЭД
                obj.countKpi = 0;
                obj.countVal = 0;
                for (let j = 0; j < namesKpi.length; j++) {
                    let value = (workSheet[namesKpi[j].col + (num + 1)] ? (workSheet[namesKpi[j].col + (num + 1)].v + "") : undefined);
                    if (!value) {
                        //console.log(namesKpi[j].col + (num + 1), namesKpi[j]['name']);
                        continue;
                    }
                    let parseArr = parseValue(value, namesKpi[j]);
                    if (parseArr.length == 0) {
                        continue;
                    }
                    //if(namesKpi[j].name == 'Н.П.1') {
                    //    console.log(parseArr);
                    //}
                    for (let ival = 0; ival < parseArr.length; ival++) {
                        let objDb = getObjForSaveInDb(user[0]['login'], namesKpi[j], parseArr[ival]);
                        //console.log(objDb);
                        let result = await DB.userValues.insertValueKpiFromObj(objDb);
                        obj.countVal++;
                        if(ival == 0) {
                            obj.countKpi ++;
                        }
                    }
                }
            } catch (e) {
                ////////////////////////////////
                if(e != "дата") {
                    obj.error = e;
                    countError++;
                    console.log(e);
                }
                //num++;
            }
            allUsers.push(obj);
            console.log("added", num);
            num++;
        }
        return {allUsers: allUsers, counts: {countError: countError, countIgnore: countIgnore}};
    }
};

function getNormNameKpi(nameKpi) {
    if(nameKpi.charAt(1) == '.')
        return nameKpi;
    if(nameKpi.substring(1).search(/\d/) == 0) {
        return nameKpi[0] + '.' + nameKpi.substring(1);
    }
    return nameKpi[0] + '.' + nameKpi[1] + '.' + nameKpi.substring(2);
}

let ruleParse = {'О.Д.1' : ['date', 'val', 'file'], 'О.Д.2' : ['date', 'val', 'file'],
    'О.Д.3' : ['date', 'val', 'file'], 'О.Д.4' : ['date', 'val', 'file'], 'О.Д.5' : ['date', 'val', 'file'],
    'О.Д.6' : ['date', 'val', 'file'], 'О.Д.7' : ['date', 'val', 'file'], 'О.Д.8' : ['date', 'val', 'file'],
    'О.Д.9' : ['date', 'val', 'file'], 'О.Д.10' : ['date', 'val', 'file'], 'О.П.1' : ['date', 'book', 'file'],
    'О.П.2' : ['date', 'book', 'file'], 'О.П.3' : ['date', 'book', 'file'], 'О.П.4' : ['date', 'val', 'file'],
    'О.П.5' : ['date', 'val', 'file'], 'Н.Д.1' : ['date', 'type', 'olimp', 'stud', 'result', 'file'],
    'Н.П.1' : ['val', 'link'], 'Н.П.2' : ['date', 'type', 'event', 'link', 'file'],
    'Н.П.3' : ['date', 'event', 'link', 'file'], 'Н.П.4' : ['date', 'event', 'link', 'file'],
    'Н.П.5' : ['date', 'event', 'link', 'file'], 'Н.П.6' : ['typekpi', 'date', 'event', 'link', 'file'],
    'Н.П.7' : ['date', 'typekpi', 'event', 'type', 'stud', 'result', 'link', 'file'],
    'Н.П.8' : ['date', 'date2', 'event', 'stud', 'file'], 'Н.П.9' : ['date', 'event', 'stud', 'file'],
    'Р.1' : ['date', 'event', 'link', 'file'], 'Р.2' : ['date', 'event', 'link', 'file'],
    'Р.3' : ['date', 'event', 'link', 'file']};


function parseValue(value, kpi) {
    let arrValues = value.split('|');
    let rule = ruleParse[kpi['name']];
    if(!rule) {
        throw 'Не найдено правило для разбора ячейки (ПЭД: ' + kpi['name'] + ')';
    }
    let resultArr = [];
    for(let i = 0; i < arrValues.length; i++) {
        let objParse = {'date': null, 'val': null, 'file': null, 'book': null, 'type': null, 'olimp': null, 'stud': null,
            'result': null, 'link': null, 'event': null, 'typekpi': null, 'date2': null};
        let arrParse = arrValues[i].split('~');
        if(arrParse.length == 1 && arrParse[0] == '') {
            continue;
        }
        for(let j = 0; j < rule.length; j++) {
            if(j >= arrParse.length) {
                break;
            }
            objParse[rule[j]] = arrParse[j];
            //console.log(rule[j],arrParse[j]);
        }
        resultArr.push(objParse);
    }
    return resultArr;
}

function getObjForSaveInDb(login, kpi, objParse) {
    let val = 1;
    if(objParse['val']) {
        val = objParse['val'];
    }
    if(!objParse['date']) {
        objParse['date'] = new Date();
        //throw "дата";
        //throw "Не установлена дата выполнения ПЭД - " + kpi['name'];
    }
    let finishDate = new Date(objParse['date']);
    if (objParse['date2']) {
        finishDate = new Date(objParse['date2']);
    } else {
        finishDate.setMonth(finishDate.getMonth() + +kpi['action_time']);
    }
    let text = getTextVal(objParse);
    //console.log('text', text);

    let file = null;
    if (objParse['file']) {
        file = objParse['file'];
    }

    let link = null;
    if (objParse['link'] && objParse['link'] != '') {
        link = objParse['link'].trim();
    }

    let numberCriterion = 0;
    if(+kpi['type'] == 2) {
        numberCriterion = +kpi['numb'] - 1;
    }

    return {'login_user': login, 'name_kpi': kpi['name'],
        'value': val, 'date': objParse['date'], 'start_date': objParse['date'],
        'finish_date': finishDate, 'text': text, 'link': link, 'file': file,
        'number_criterion': numberCriterion};
}

function getTextVal(objParse) {
    let text = '';
    if(objParse['event'] && objParse['event'] != '') {
        text += 'Событие: ' + objParse['event'] + "\n";
    }
    if(objParse['book'] && objParse['book'] != '') {
        text += 'Книга: ' + objParse['book'] + "\n";
    }
    if(objParse['olimp'] && objParse['olimp'] != '') {
        text += 'Олимпиада: ' + objParse['olimp'] + "\n";
    }
    if(objParse['type'] && objParse['type'] != '') {
        text += 'Тип мероприятия: ' + objParse['type'] + "\n";
    }
    if(objParse['stud'] && objParse['stud'] != '') {
        text += 'Информация о студенте(ах): ' + objParse['stud'] + "\n";
    }
    if(objParse['result'] && objParse['result'] != '') {
        text += 'Результат: ' + objParse['result'] + "\n";
    }
    //if(objParse['link'] && objParse['link'] != '') {
    //    text += 'Ссылка: ' +  '<a href="' + objParse['link'] + '">Ссылка</a>';
    //}
    if(text == '') {
        text = null;
    }
    return text;
}

async function getNamesKpiFromFile(workSheet) {
    for(let j = 0; j < colunms.length; j++) {
        let nameKpi = (workSheet[colunms[j] + 1] ? (workSheet[colunms[j] + 1].v + "") : undefined);
        if (!nameKpi) {
            break;
        }
        nameKpi = nameKpi.split('-');
        let numbCrit;
        let objKpi = {};
        if (nameKpi && nameKpi.length > 1) {
            numbCrit = +nameKpi[1];
            nameKpi = nameKpi[0];
            if (!numbCrit) {
                return 'Попытка получить число после символа "-" в ПЭД ' + nameKpi;
            }
            objKpi.numb = numbCrit;
        } else if (nameKpi) {
            nameKpi = nameKpi[0];
        }
        nameKpi = getNormNameKpi(nameKpi);
        let result = await DB.kpi.selectOneKpi(nameKpi);
        if(!result || !result[0]) {
            return "ПЭД " + nameKpi + "не найден в БД";
        }
        objKpi.name = nameKpi;
        objKpi.action_time = result[0]['action_time'];
        objKpi.type = result[0]['type'];
        objKpi.col = colunms[j];
        console.log(objKpi.name, objKpi.col);

        namesKpi.push(objKpi);
    }
    return null;
}
