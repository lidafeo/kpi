let DBs = require('./db/select.js');
module.exports = {
    main: async function(workSheet) {
        let num = 1;
        addUsers = [];
        allUsers = [];
        while(true) {
            let obj = {};
            //порядковый номер
            numb = workSheet["A" + (num + 1)] ? (workSheet["A" + (num + 1)].v + "") : undefined;
            //имя
            let name = (workSheet["B" + (num + 1)] ? (workSheet["B" + (num + 1)].v + "") : undefined);
            if(!name) {
                break;
            }
            obj.name = name;
            obj.numb = numb;
            //должность
            let positions = (workSheet["C" + (num + 1)] ? (workSheet["C" + (num + 1)].v + "") : undefined);
            obj = await this.addPosition(positions, obj);
            //вид занятости
            let employment = (workSheet["D" + (num + 1)] ? (workSheet["D" + (num + 1)].v + "") : undefined);
            if(employment && employment.toLowerCase().indexOf("основ")) {
                obj.empl = "main";
            }
            else {
                obj.empl = "no_main";
            }
            //кафедра и факультет
            let department = (workSheet["E" + (num + 1)] ? (workSheet["E" + (num + 1)].v + "") : undefined);
            obj = await this.addDepartment(department, obj);
            //логин
            obj = getLogin(obj);
            if(!obj.error) {
                addUsers.push(obj);
            }
            allUsers.push(obj);

            console.log(obj.numb, obj.name, obj.faculty, obj.department);//, obj.empl, obj.faculty, obj.department);
            num++;
        }
        return {allUsers: allUsers, addUsers: addUsers};
    },
    addPosition: async function (positions, obj) {
        //должность
        if(positions) {
            let arrPos = positions.split(',');
            let find = false;
            for(let po = 0; po < arrPos.length; po++) {
                if(arrPos[po] && arrPos[po].trim().toLowerCase().startsWith('и.о.')) {
                    let ind = arrPos[po].trim().toLowerCase().indexOf('и.о.')
                    arrPos[po] = arrPos[po].slice(ind + 'и.о.'.length).trim();
                }
                let pos = await DBs.selectOnePositionWithLike(arrPos[po].trim());
                if(pos[0] && pos.length == 1) {
                    find = true;
                    obj.position = pos[0]['position'];
                    obj.posLevel = pos[0]['level'];
                    break;
                }
                else {
                    pos = await DBs.selectOnePosition(arrPos[po].trim());
                    if(pos[0]) {
                        find = true;
                        obj.position = pos[0]['position'];
                        obj.posLevel = pos[0]['level'];
                        break;
                    }
                }
            }
            if(!find) {
                obj.error = "Должность не найдена в БД";
                obj.position = positions;
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
                let  result = await DBs.selectDepartmentWithLike(dep[i]);
                if(result[0] && result[0]['department'] && result[0]['faculty'] && result.length == 1) {
                    obj.department = result[0]['department'];
                    obj.faculty = result[0]['faculty'];
                    find = true;
                    break;
                }
                //пробуем найти без like
                if(result[0] && result.length > 1) {
                    let result = await
                    DBs.selectDepartment(dep[i]);
                    if (result[0] && result[0]['department'] && result[0]['faculty'] && result.length == 1) {
                        obj.department = result[0]['department'];
                        obj.faculty = result[0]['faculty'];
                        find = true;
                        break;
                    }
                }
            }
            if(!find && !obj.error) {
                obj.error = "Кафедра не найдена";
                obj.errField = 'department';
                obj.department = department;
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
                obj.faculty = department;
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
        arr.push(purpose.replace(/'/g, "").trim());
        arr.push(purpose.replace(/"/g, "").trim());
    }
    //пытаемся найти по названию в кавычках
    if (purpose.includes('"')) {
        arr.push(purpose.slice(purpose.indexOf('"') + 1, purpose.lastIndexOf('"')).trim());
    }
    /*
    //пытаемся найти по названию в кавычках и аббривиатуре
    if (purpose.includes('"') && (purpose.includes('(') && purpose.includes(")"))) {
        purpose = purpose.slice(purpose.indexOf('"') + 1, purpose.lastIndexOf('"')).trim()
            + ' (' + purpose.slice(purpose.indexOf('(') + 1, purpose.indexOf(')')).trim() + ')';
        arr.push(purpose);
    }
     */
    return arr;
}

function getLogin(obj) {
    let alphabet = {а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'j', з: 'z', и: 'i', й: '', к: 'k', л: 'l',
        м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
        ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'};
    let fullName = obj.name.trim().split(" ");
    if(!fullName || fullName.length == 0) {
        if(!obj.error) {
            obj.error = "Не найдено имя";
            obj.errField = 'login';
        }
        return obj;
    }
    let login = (fullName && fullName.length > 1) ? (alphabet[fullName[1][0].toLowerCase()] + '.') : '';
    login += (fullName && fullName.length > 2) ? (alphabet[fullName[2][0].toLowerCase()] + '.') : '';
    for(let i = 0; i < fullName[0].length; i++) {
        login += alphabet[fullName[0][i].toLowerCase()];
    }
    obj.login = login;
    return obj;
}