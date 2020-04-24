let DB = require('./db');

function getFaculty (structure) {
    let faculty = [];
    for (let i = 0; i < structure.length; i++) {
        if(faculty.indexOf(structure[i].faculty) == -1)
            faculty.push(structure[i].faculty);
    }
    return faculty;
}
exports.getFaculty = getFaculty;

function getDepartment(faculty, structure) {
    let department = [];
    for(let i = 0; i < structure.length; i++)
        if(structure[i].faculty == faculty)
            department.push(structure[i].department);
    return department;
}
exports.getDepartment = getDepartment;

exports.getFacultyForVerify = async function (level, faculty, department) {
    let facultyArr = [];
    let departmentArr = [];
    switch(level) {
        //проректор
        case 10:
            let structure = await DB.structure.selectStructure();
            facultyArr = getFaculty(structure);
            departmentArr = getDepartment(facultyArr[0], structure);
            break;
        //декан
        case 2:
            let result = await DB.structure.selectDepartments(faculty);
            facultyArr.push(faculty);
            for(let i = 0; i < result.length; i++) {
                departmentArr.push(result[i].department);
            }
            break;
        //зав. кафедрой
        case 1:
            facultyArr.push(faculty);
            departmentArr.push(department);
            break;
        //другие
        default:
            throw new Error("Server Error: no permissions");
            break;
    }
    return {faculty: facultyArr, department: departmentArr};
};