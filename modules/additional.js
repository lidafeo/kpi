exports.getFaculty = function (structure) {
	let faculty = [];
	for (let i = 0; i < structure.length; i++) {
		if(faculty.indexOf(structure[i].faculty) == -1)
			faculty.push(structure[i].faculty);
	}
	return faculty;
};

exports.getDepartment = function (faculty, structure) {
	let department = [];
	for(let i = 0; i < structure.length; i++)
		if(structure[i].faculty == faculty) 
			department.push(structure[i].department);
	return department;
};

function getSymb() {
	var abc = "abcdefghijklmnopqrstuvwxyz";
	return abc[Math.floor(Math.random() * abc.length)];
}

exports.generateFileName = function (login) {
	let date = new Date();
	return login.split('.').join('') +
		getSymb() + date.getMonth() +
		getSymb() + date.getDate() +
		getSymb() + date.getFullYear() +
		getSymb() + date.getMinutes() +
		getSymb() + date.getSeconds() +
		getSymb() + date.getHours() +
		getSymb() + date.getMilliseconds();
};