let DBs = require('./db/select.js');

let colunms = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
    'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH',
    'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ'];

let namesKpi = [];

module.exports = {
    main: async function(workSheet, checkVal) {
        let num = 1;
        let countError = 0;
        let countIgnore = 0;
        //addNames = []; addUsers = [];
        allNames = []; allUsers = [];

        let errParse = getNamesKpiFromFile(workSheet);
        console.log("Pasrse names kpi", errParse);

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
            let user = await DBs.selectOneUserByName(name);
            if(!user[0]) {
                obj.name = name;
                obj.error = "Пользоватeль не найден в БД";
                countError ++;
                num++;
                allUsers.push(obj);
                continue;
            }

            obj.name = name;

            //парсим значения ПЭД
            for(let j = 0; j < namesKpi.length; j++) {
                let value = (workSheet[namesKpi[j].col + (num + 1)] ? (workSheet[namesKpi[j].col + (num + 1)].v + "") : undefined);
                if(!value) {
                    continue;
                }
                parseValue(value, namesKpi[j]);
            }
            allUsers.push(obj);
            num++;
        }
        return {allUsers: allUsers, counts: {countError: countError, countIgnore: countIgnore}};
    }
}

function getNormNameKpi(nameKpi) {
    if(nameKpi.charAt(1) == '.')
        return nameKpi;
    if(nameKpi.substring(1).search(/\d/) == 0) {
        return nameKpi[0] + '.' + nameKpi.substring(1);
    }
    return nameKpi[0] + '.' + nameKpi[1] + '.' + nameKpi.substring(2);
}


let ruleParse = ['О.Д.1' : '', 'О.Д.2' : '', 'О.Д.3' : '', 'О.Д.4' : '', 'О.Д.5' : '',
    'О.Д.6' : '', 'О.Д.7' : '', 'О.Д.8' : '', 'О.Д.9' : '', 'О.Д.10' : '',
    'О.П.1' : '', 'О.П.2' : '', 'О.П.3' : '', 'О.П.4' : '', 'О.П.5' : '',
    'Н.Д.1' : '', 'Н.П.1' : '', 'Н.П.2' : '', 'Н.П.3' : '', 'Н.П.4' : '',
    'Н.П.5' : '', 'Н.П.6' : '', 'Н.П.7' : '', 'Н.П.8' : '', 'Н.П.9' : '',
    'Р.1' : '', 'Р.2' : '', 'Р.3' : ''];


function parseValue(value, kpi) {
    let date = value.split('~');
    console.log(date[0]);
}

function getNamesKpiFromFile(workSheet) {
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
        objKpi.name = nameKpi;
        objKpi.col = colunms[j];

        namesKpi.push(objKpi);
    }
    return null;
}