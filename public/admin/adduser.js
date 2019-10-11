$(document).ready(function() {

	let structure;
	$("#faculty").attr("disabled", true);
	new Promise((resolve, reject) => {
		getStructure(resolve);
	}).then(result => {
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

	$('#add').click(function(e) {
		let name = $("#name").val();
		if(!$("#name").val() || !$("#login").val() || !$("#password").val()) {
			e.preventDefault();
			$('#error').html('<h4>Заполните все поля!</h4>');
			$('html, body').animate({scrollTop: 0}, 500);
		}
	});


	function getInfo() {
		let position = $("#position option:selected").text();
		if(position == "Проректор" || position == "Администратор" || position == "ПФУ") {
			$("#numdepartment").val(0);
			$("#faculty option:selected").text("");
			$('#departmentdiv').hide();
			$('#facultydiv').hide();
			$("#faculty").attr("disabled", true);
			$("#department").attr("disabled", true);
		}
		else if(position == "Декан") {
			let str;
			for(let i = 0; i < structure.faculty.length; i++){
				str +="<option>" + structure.faculty[i] + "</option>";
			}
			$("#department").attr("disabled", true);
			$('#faculty').html(str);
			$('#facultydiv').show();
			$("#faculty").attr("disabled", false);
			$("#numdepartment").val(0);
			$('#departmentdiv').hide();
		}
		else {
			$('#facultydiv').show();
			$("#faculty").attr("disabled", false);
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
			$('#departmentdiv').show();
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