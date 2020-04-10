const bcrypt = require("bcrypt");

//функции работы с БД
let DBs = require('../modules/db/select.js');
let DBi = require('../modules/db/insert.js');

let BCRYPT_SALT_ROUNDS = 12;

let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;
let funcStructure = require('../modules/func-structure');

//GET-запрос страницы для добавления ППС
exports.pageAddPps = function(req, res) {
    getPositionsAndStructure().then(info => {
        let facultyArr = funcStructure.getFaculty(info.structure);
        let departmentArr = funcStructure.getDepartment(facultyArr[0], info.structure);

        res.render('change-pps/page-add-pps', {positions: info.positions, faculty: facultyArr,
            department: departmentArr, infoUser: req.session, pageName: '/change-pps/add-pps'});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на добавление ППС
exports.addPps = function(req, res) {
    console.log("Добавление ППС");
    console.log(req.body);
    let newUser = req.body;
    if(!newUser.department || newUser.position == 'Декан') {
        newUser.department = null;
    }
    if(newUser.position == 'Декан' || newUser.position == 'Заведующий кафедрой') {
        newUser.role = 'Руководитель подразделения';
    } else {
        newUser.role = 'ППС';
    }

    bcrypt.hash(newUser.password, BCRYPT_SALT_ROUNDS).then(function(hashedPassword) {
        newUser.password = hashedPassword;
        DBi.insertUserFromObj(newUser).then(result => {
            //запись логов
            writeLogs(req.session.login, req.session.position, "добавил(а) нового пользователя: login - " + newUser.login);
            console.log("Сохранен объект user");
            res.json({result: 'Пользователь успешно добавлен'});
        }).catch(err => {
            writeErrorLogs(req.session.login, err);
            console.log(err);
            res.json({err: 'Не удалось добавить пользователя'});
        });
    }).then(function() {
        console.log("Пароль успешно хеширован");
    }).catch(function(err) {
        writeErrorLogs(req.session.login, err);
        console.log(err);
        res.status(500).render('error/500');
    });
};

async function getPositionsAndStructure() {
    let structure = await DBs.selectStructure();
    let positions = await DBs.selectPositions();
    return {'structure': structure, 'positions': positions};
}