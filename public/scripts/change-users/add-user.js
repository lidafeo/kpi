$(document).ready(function() {

	let structure;
	$("#faculty").attr("disabled", true);
	new Promise((resolve, reject) => {
		getStructure(resolve);
	}).then(result => {
		if($('#login').attr('type') != 'hidden') {
			getInfo();
		}
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
		let level = $("#position option:selected").data('level');
		$('#position-div').addClass('d-none');
		$("#position").attr("disabled", true);

		if(role == "ППС" || role == "Руководитель подразделения") {
			let rolePps = (role == "ППС") ? true : false;
			let first = true;
			let needChange = ((rolePps && level == 0) || (!rolePps && level > 0)) == false;
			$("#position > option").each(function() {
				let lev = $(this).data('level');
				debugger;
				if((rolePps && lev == 0) || (!rolePps && lev > 0)) {
					$(this).removeClass('d-none');
					if(first && needChange) {
						$(this).attr("selected", "selected");
						level = lev;
					}
					first = false;
				} else {
					$(this).addClass('d-none');
				}
			});
			$('#position-div').removeClass('d-none');
			$("#position").attr("disabled", false);
		}

		if((role == "ППС" || role == "Руководитель подразделения") && level < 2) {
			$('#faculty-div').removeClass('d-none');
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
			//$("#numdepartment").val(1);
			$('#department-div').removeClass('d-none');
		}
		else if((role == "ППС" || role == "Руководитель подразделения") && level >= 2) {
			let str = "";
			for(let i = 0; i < structure.faculty.length; i++) {
				str +="<option>" + structure.faculty[i] + "</option>";
			}
			$("#department").attr("disabled", true);
			$('#faculty').html(str);
			$('#faculty-div').removeClass('d-none');
			$("#faculty").attr("disabled", false);
			//$("#numdepartment").val(0);
			$('#department-div').addClass('d-none');
		}
		else {
			$("#faculty option:selected").text("");
			$('#department-div').addClass('d-none');
			$('#faculty-div').addClass('d-none');
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