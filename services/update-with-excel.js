const fs = require("fs");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const xlsx = require("xlsx");

let DB = require('../modules/db');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let userFunc = require('../modules/func-user');
let pastKpiFunc = require('../modules/past-kpi');

//запрос на добавление пользователей с файла вариант 1
exports.addUsersFromFile1 = async function(user, files) {
    let workBook = xlsx.readFile(files.file.path);
    let firstSheetName = workBook.SheetNames[0];
    let workSheet = workBook.Sheets[firstSheetName];

    let address = {"B": "faculty", "C": "department", "D": "position", "E": "login", "F": "password"};
    let num = 0;
    let arrUsers = [];
    while (true) {
        let obj = {};
        let name = (workSheet["A" + (num + 1)] ? (workSheet["A" + (num + 1)].v + "") : undefined);
        if (!name) break;
        obj.name = name;
        for (let key in address) {
            let addr = key + (num + 1);
            obj[address[key]] = (workSheet[addr] ? (workSheet[addr].v + "") : undefined);
        }
        let positionDB = await DB.positions.selectOnePosition(obj.position);
        if(!positionDB[0]) {
            return {"err": "Такой должности не существует " + obj.position +
                    " (пользователь " + obj.name + ")"};
        }
        if(positionDB[0].level > 0) {
            obj.role = "Руководитель подразделения";
        } else {
            obj.role = "ППС";
        }
        if (obj.role && obj.login && obj.password && obj.position) {
            arrUsers.push(obj);
        } else {
            return {"err": "Не хватает данных у пользователя " + name};
        }
        let userDB = await DB.users.selectOneUser(obj.login);
        if(userDB[0] && userDB[0].login != "") {
            return {"err": "Пользователь " + userDB[0].login + " уже существует"};
        }
        num++;
    }
    for(let i = 0; i < arrUsers.length; i++) {
        //добавляем
        arrUsers[i].password = await bcrypt.hash(arrUsers[i].password, BCRYPT_SALT_ROUNDS);
        let result = await DB.users.insertUserFromObj(arrUsers[i]);
        //записываем логи
        writeLogs(user.login, user.position, "добавил(а) нового пользователя: login - " + arrUsers[i].login);
    }
    return {result: "Пользователи успешно добавлены"};
};