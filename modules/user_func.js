let DBs = require('./db/select.js');
module.exports = {
    main: function(user, action) {
        let date = new Date();
        let strTime = timeToString(date);
        let namefile = dateToString(date) + '.log';
        fs.appendFileSync("./log/" + namefile, strTime + " " + user + " " + action + ";\r\n");
    },
    addPosition: async function (positions, obj) {
        //должность
        if(positions) {
            let arrPos = positions.split(',');
            let find = false;
            for(let po = 0; po < arrPos.length; po++) {
                let pos = await DBs.selectOnePosition(arrPos[po].trim());
                if(pos[0]) {
                    find = true;
                    obj.position = pos[0]['position'];
                    obj.posLevel = pos[0]['level'];
                    break;
                }
            }
            if(!find) {
                obj.error = "Должность не найдена в БД";
                obj.errField = 'position';
            }
        }
        else {
            obj.error = "Должность не найдена в файле";
            obj.errField = 'position';
        }
        return obj;
    },
    addDepartment: async function (department, obj) {
        //кафедра и факультет
        if(obj.posLevel > 2) {
            return obj;
        }
        if(department && (obj.posLevel == 0 || obj.posLevel == 1)) {
            let find = false;
            let dep = getSearchOption(department,['кафедра']);
            //сам поиск
            for(let i = 0; i < dep.length; i++) {
                result = await DBs.selectDepartment(dep[i]);
                if(result[0] && result[0]['department'] && result[0]['faculty']) {
                    obj.department = result[0]['department'];
                    obj.faculty = result[0]['faculty'];
                    find = true;
                    break;
                }
            }
            if(!find && !obj.error) {
                obj.error = "Кафедра не найдена";
                obj.errField = 'department';
            }
        }
        else if(department && obj.posLevel == 2) {
            let find = false;
            let fac = getSearchOption(department,['деканат факультета', 'деканат']);
            //сам поиск
            for(let i = 0; i < fac.length; i++) {
                result = await DBs.selectOneFaculty(fac[i]);
                if(result[0] && result[0]['faculty']) {
                    obj.department = "";
                    obj.faculty = result[0]['faculty'];
                    find = true;
                    break;
                }
            }
            if(!find && !obj.error) {
                obj.error = "Факультет не найден";
                obj.errField = 'faculty';
            }
        } else if(!obj.error) {
            obj.error = "Подразделение не найдено в файле";
            obj.errField = 'department';
        }
        return obj;
    }
}

function getSearchOption(purpose, words) {
    let arr = [purpose];
    //пытаемся найти без слов words
    for(let i = 0; i < words.length; i++) {
        if (purpose.trim().toLowerCase().startsWith(words[i])) {
            purpose = purpose.slice(purpose.toLowerCase().indexOf(words[i]) + words[i].length).trim();
            arr.push(purpose);
        }
    }
    //пытаемся найти по аббривиатуре
    if(purpose.includes('(') && purpose.includes(")")) {
        arr.push(purpose.slice(purpose.indexOf('(') + 1, purpose.indexOf(')')).trim())
    }
    //пытаемся найти по полному названию без кавычек
    if(purpose.includes('"') || purpose.includes("'")) {
        purpose = purpose.replace(/'/g, "").trim();
        purpose = purpose.replace(/"/g, "").trim();
        arr.push(purpose);
    }
    return arr;
}