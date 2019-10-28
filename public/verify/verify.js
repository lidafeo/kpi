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
		if(!chooseUser) {
			if(!$("p").is("#errormess"))
				$("#name").after('<p id="errormess" class="errormess">Выберите пользователя</p>');
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
			$('#tablekpi').html(request.response);
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
		request.open("POST", "/getworkers", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$("#usersdiv").html(request.response);
		});
		request.send(sendValue);
	});

	$("body").on('click', "#incorrect", function() {
		let checkboxes = document.getElementsByName('checkbox');
		//let value = [];
		let incorrectKpi = [];
		//определяем выбранное значение
		for( let i = 0; i < checkboxes.length; i++) {
			if(checkboxes[i].checked) {
				let id =  $("#hd" + i).val();
				let comment = $("#comm" + i).val();
				if(!comment)
					return alert("Обязательное поле: комментарий");
				let name_kpi = $("#kpi" + i).val();
				let obj = {id: id, comment: comment, name: name_kpi};
				incorrectKpi.push(obj);
			}
		}
		if(incorrectKpi.length == 0)
			return alert("Выберите неверные значения");
		let sendValue = JSON.stringify({kpi: incorrectKpi, user: $("#chooseuser").val()});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/invalid"
		request.open("POST", "/invalid", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			document.querySelector('#submit').click();
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