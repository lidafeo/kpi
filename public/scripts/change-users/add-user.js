$(document).ready(function() {

	let structure;
	$("#faculty").attr("disabled", true);
	new Promise((resolve, reject) => {
		getStructure(resolve);
	}).then(result => {
		getInfo();
	});

	//изменение роли
	$('#role').change(function() {
		getInfo();
	});
	//изменение должности
	$('#position').change(function() {
		getInfo();
	});

	//изменение факультета
	$("body").on('change', "#faculty", function() {
		let faculty = structure.faculty;
		let chooseFaculty = $("#faculty option:selected").text();
		let arrDep = structure.department[faculty.indexOf(chooseFaculty)];
		let departmentHTML = "";
		for(let i = 0; i < arrDep.length; i++) {
			departmentHTML += "<option>" + arrDep[i] + "</option>";
		}
		$('#department').html(departmentHTML);
	});

	function getInfo() {
		let role = $("#role option:selected").text();
		let position = $("#position option:selected").text();
		//console.log(structure);
		$('#position-div').hide();
		$("#position").attr("disabled", true);

		if(role == "ППС" || role == "Руководитель подразделения") {
			$('#position-div').show();
			$("#position").attr("disabled", false);
		}
		if((role == "ППС" || role == "Руководитель подразделения") && position != "Декан") {
			$('#faculty-div').show();
			$("#faculty").attr("disabled", false);
			$("#department").attr("disabled", false);
			let str;
			for(let i = 0; i < structure.faculty.length; i++)
				str +="<option>" + structure.faculty[i] + "</option>";
			$('#faculty').html(str);
			let chooseFaculty = $("#faculty option:selected").text();
			let arrDep = structure.department[structure.faculty.indexOf(chooseFaculty)];
			let departmentHTML = "";
			for(let i = 0; i < arrDep.length; i++) {
				departmentHTML += "<option>" + arrDep[i] + "</option>";
			}
			$('#department').html(departmentHTML);
			$("#numdepartment").val(1);
			$('#department-div').show();
		}
		else if((role == "ППС" || role == "Руководитель подразделения") && position == "Декан") {
			let str = "";
			for(let i = 0; i < structure.faculty.length; i++) {
				str +="<option>" + structure.faculty[i] + "</option>";
			}
			$("#department").attr("disabled", true);
			$('#faculty').html(str);
			$('#faculty-div').show();
			$("#faculty").attr("disabled", false);
			$("#numdepartment").val(0);
			$('#department-div').hide();
		}
		else {
			$("#numdepartment").val(0);
			$("#faculty option:selected").text("");
			$('#department-div').hide();
			$('#faculty-div').hide();
			$("#faculty").attr("disabled", true);
			$("#department").attr("disabled", true);
		}
	}

	function getStructure(resolve) {
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/structure.json"
		request.open("GET", "/structure.json", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			structure = JSON.parse(request.response);
			$("#faculty").attr("disabled", false);
			resolve();
		});
		request.send();
	}
});