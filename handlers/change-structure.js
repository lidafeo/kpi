let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

let changeStructureService = require('../services/change-structure');

//GET-запрос страницы для изменения кафедры
exports.pageChangeDepartment = function(req, res, next) {
    let user = req.session;
    let department = req.query.department;
    changeStructureService.pageChangeDepartment(user, department).then(result => {
        if (!result) {
            return next();
        }
        res.render('change-structure/page-change-department', {infoUser: user,
            pageName: '/change-structure/change-department', ...result});
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на изменение кафедры
exports.changeDepartment = function(req, res) {
    let user = req.session;
    let info = req.body;
    changeStructureService.changeDepartment(user, info).then(result => {
        res.json(result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};

//POST-запрос на изменение факультета
exports.changeFaculty = function(req, res) {
    let user = req.session;
    let faculty = req.body.faculty;
    let oldFaculty = req.body.oldFaculty;
    changeStructureService.changeFaculty(user, faculty, oldFaculty).then(result => {
        res.json(result);
    }).catch(err => {
        console.log(err);
        writeErrorLogs(req.session.login, err);
        res.status(500).render('error/500');
    });
};