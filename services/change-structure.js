let DB = require('../modules/db');

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//запрос страницы для изменения подразделения кафедра
exports.pageChangeDepartment = async function(user, department) {
    let structure = await DB.structure.selectDepartment(department);
    let faculties = await DB.structure.selectAllFaculties();
    let arrFaculties = [];
    for(let i = 0; i < faculties.length; i++) {
        arrFaculties.push(faculties[i].faculty);
    }
    if(!structure[0]) {
        return false;
    }
    return {structure: structure[0], faculties: arrFaculties};
};

//запрос на изменение подразделения кафедра
exports.changeDepartment = async function(user, structure) {
    if(!structure.department || !structure.oldDepartment || !structure.faculty) {
        return {err: "Введите данные"};
    }
    //Проверяем, есть ли такой факультет
    let faculty = await DB.structure.selectOneFaculty(structure.faculty);
    if(!faculty[0]) {
        return {err: "Такого факультета не существует!"};
    }
    //проверяем, существует ли такой факультет на кафедре
    let department = await DB.structure.selectDepartment(structure.department);
    if(department[0] && department[0].faculty == structure.faculty) {
        return (structure.department == structure.oldDepartment) ? {err: "Введите изменения!"} : {err: "Такая кафедра уже существует!"};
    }
    let newStructure = {department: structure.department, faculty: structure.faculty};
    //Вносим изменения
    let changeStructure = await DB.structure.updateDepartment(structure.oldDepartment, newStructure);
    let changeStructureInUsers = await DB.users.updateDepartmentForUsers(structure.oldDepartment, newStructure);
    return {result: "Кафедра успешно изменена!"};
};

//запрос на изменение подразделения факультет
exports.changeFaculty = async function(user, faculty, oldFaculty) {
    if(!faculty || !oldFaculty) {
        return {err: "Введите данные"};
    }
    //Проверяем, есть ли уже такой факультет
    let facultyFromDb = await DB.structure.selectOneFaculty(faculty);
    if(facultyFromDb[0]) {
        return (faculty == oldFaculty) ? {err: "Введите изменения!"} : {err: "Такой факультет уже существует!"};
    }
    //Вносим изменения
    let changeStructure = await DB.structure.updateFaculty(oldFaculty, faculty);
    let changeStructureInUsers = await DB.users.updateFacultiesForUsers(oldFaculty, faculty);
    return {result: "Факультет успешно изменен!"};
};