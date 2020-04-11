$(document).ready(function() {
	let structure;

	if($("#faculty > option").length > 1) {
		$("#faculty").attr("disabled", true);
		getStructure();
	}

	$.cookie("choosefaculty", $("#faculty").val());
	$.cookie("choosedepartment", $("#department").val());

	var data = {}; 
	$("#worker option").each(function(i, el) {  
		data[$(el).data("value")] = $(el).val();
	});
	//нажатие на кнопку отправки на сервер сотрудника
	$("body").on('click', "#submit", function(e) {
		e.preventDefault();
		let chooseUser = $("#name").val();
		let name = $('#worker [value="' + chooseUser + '"]').data('value');

		let element = $("#name")[0];
		element.setCustomValidity("");
		$("#name").removeClass("is-invalid");
		if(!chooseUser || !name) {
			$("#name").addClass("is-invalid");
			element.setCustomValidity("Invalid field");
			return;
		}
		if(chooseUser)
			$("#errormess").remove();
		//запоминаем выбранного пользователя
		$("#chooseuser").val(name);

		let sendValue = JSON.stringify({name: name});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/verify", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$('#tablekpi').hide();
			$('#tablekpi').html(request.response);
			$('#tablekpi').slideDown(500);
		});
		request.send(sendValue);
	});

	//изменение факультета
	$('#faculty').change(function() {
		let faculty = structure.faculty;
		let chooseFaculty = $("#faculty option:selected").text();
		let arrDep = structure.department[faculty.indexOf(chooseFaculty)];
		let departmentHTML = "";
		for(let i = 0; i < arrDep.length; i++) {
			departmentHTML += "<option>" + arrDep[i] + "</option>";
		}
		$('#department').html(departmentHTML);
	});

	//очистка поля user
	$("body").on('mousedown', "#name", function(e) {
		$("#name").val("");
		$("#name").removeClass("is-invalid");
		let element = $("#name")[0];
		element.setCustomValidity("Invalid field");
	});

	$("#choosedep").click(function(e) {
		e.preventDefault();
		$.cookie("choosefaculty", $("#faculty").val());
		$.cookie("choosedepartment", $("#department").val());

		let faculty = $("#faculty").val();
		let department = $("#department").val();
		if(!faculty || !department)
			return alert("Заполните поля");
		
		let sendValue = JSON.stringify({faculty: faculty, department: department});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/getworkers"
		request.open("POST", "/get-workers", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$('#usersdiv').hide();
			$('#usersdiv').html(request.response);
			$('#usersdiv').slideDown(500);
		});
		request.send(sendValue);
	});

	if($("#department").attr("disabled") == "disabled") {
		(async function() {
			let chooseDep = await $("#choosedep").click();
			$("#choosedep").remove();
		})();
	}

	function getStructure() {
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/structure.json"
		request.open("GET", "/structure.json", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			structure = JSON.parse(request.response);
			$("#faculty").attr("disabled", false);
		});
		request.send();
	}
});