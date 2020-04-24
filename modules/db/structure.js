const query = require('./connect-db');

//добавление каферды с объекта
exports.insertDepartment = function(dep) {
    return query("INSERT INTO structure VALUES (?, ?, ?, ?)",
        [dep.faculty, dep.department, dep.abbr_faculty, dep.abbr_department]);
};

//очистка таблицы structure
exports.deleteStructure = function() {
    return query("DELETE FROM structure");
};

//получить полную структуру
exports.selectStructure = function() {
    return query("SELECT * from structure");
};

//получить структуру отсортированную по факультетам
exports.selectStructureOrderByFaculty = function() {
    return query("SELECT * from structure order by faculty ASC, department ASC");
};

//получить кафедры факультета
exports.selectDepartments = function(faculty) {
    return query("SELECT department FROM structure " +
        "WHERE faculty=?",
        [faculty]);
};
/*
//получить одну кафедру
exports.selectOneDepartments = function(department) {
    return query("SELECT department FROM structure " +
        "WHERE department=?",
        [department]);
};
 */
/*
//получить факультет кафедры
exports.selectFacultyOfDepartment = function(department) {
    return query("SELECT faculty FROM structure " +
        "WHERE department=?",
        [department]);
};
 */

//получить факультет
exports.selectOneFaculty = function(faculty) {
    return query("SELECT faculty FROM structure " +
        "WHERE faculty=? OR abbr_faculty=?",
        [faculty, faculty]);
};
/*
//получить кафедру по аббривиатуре
exports.selectDepartmentByAbbr = function(abbr) {
    return query("SELECT department, faculty FROM structure " +
        "WHERE abbr_department=?",
        [abbr]);
};
 */

//получить кафедру по аббривиатуре или названию
exports.selectDepartment = function(dep) {
    return query("SELECT department, faculty FROM structure " +
        "WHERE abbr_department=? OR department=?",
        [dep, dep]);
};

//получить кафедру по like аббривиатуре или названию
exports.selectDepartmentWithLike = function(dep) {
    return query("SELECT department, faculty FROM structure " +
        "WHERE abbr_department=? OR department=? OR department LIKE '%" + dep + "%'",
        [dep, dep]);
};