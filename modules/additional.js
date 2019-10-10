exports.getFaculty = function (structure) {
	let faculty = [];
	for (let i = 0; i < structure.length; i++) {
		if(faculty.indexOf(structure[i].faculty) == -1)
			faculty.push(structure[i].faculty);
	}
	return faculty;
}

exports.getDepartment = function (faculty, structure) {
	let department = [];
	for(let i = 0; i < structure.length; i++)
		if(structure[i].faculty == faculty) 
			department.push(structure[i].department);
	return department;
}