$(document).ready(function() {
	let structure;

	if($("#faculty > option").length > 1) {
		debugger;
		$("#faculty").attr("disabled", true);
		getStructure().then(function (result) {
			checkCookie('faculty').then(function(result){});
		});
	} else if($("#department > option").length > 1) {
		checkCookie('department').then(function(result){});
	} else {
		checkCookie('workers').then(function(result){});
	}

	let data = {};
	$("#worker option").each(function(i, el) {  
		data[$(el).data("value")] = $(el).val();
	});

	//нажатие на кнопку отправки на сервер сотрудника
	$("#usersdiv").on('click', "#submit", function(e) {
		e.preventDefault();
		getTableForVerify().then(function(result){});
	});
	function getTableForVerify() {
		return new Promise(function(resolve, reject) {
			let chooseUser = $("#name").val();
			let name = $('#worker [value="' + chooseUser + '"]').data('value');
			//добавляем в cookie
			$.cookie("choose-user", name);

			let element = $("#name")[0];
			element.setCustomValidity("");
			$("#name").removeClass("is-invalid");
			if (!chooseUser || !name) {
				$("#name").addClass("is-invalid");
				element.setCustomValidity("Invalid field");
				return;
			}
			if (chooseUser)
				$("#errormess").remove();
			//запоминаем выбранного пользователя
			$("#chooseuser").val(name);
			let sendValue = JSON.stringify({name: name});
			let request = new XMLHttpRequest();
			//посылаем запрос на адрес "/editkpi"
			request.open("POST", "/verify", true);
			request.setRequestHeader("Content-Type", "application/json");
			request.addEventListener("load", function () {
				$('#tablekpi').hide();
				$('#tablekpi').html(request.response);
				$('#tablekpi').slideDown(500);
				resolve();
			});
			request.send(sendValue);
		});
	}

	//изменение факультета
	$('#faculty').change(function() {
		changeFaculty()
	});
	function changeFaculty() {
		let faculty = structure.faculty;
		let chooseFaculty = $("#faculty option:selected").text();
		//добавляем в cookie
		$.cookie("choose-faculty", chooseFaculty);
		let arrDep = structure.department[faculty.indexOf(chooseFaculty)];
		let departmentHTML = "";
		for(let i = 0; i < arrDep.length; i++) {
			departmentHTML += "<option>" + arrDep[i] + "</option>";
		}
		$('#department').html(departmentHTML);
	}

	//очистка поля user
	$("body").on('mousedown', "#name", function(e) {
		$("#name").val("");
		$("#name").removeClass("is-invalid");
		let element = $("#name")[0];
		element.setCustomValidity("Invalid field");
	});

	$("#choosedep").click(function(e) {
		e.preventDefault();
		getWorkers().then(function(result){});
	});

	function getWorkers() {
		return new Promise(function(resolve, reject) {
			console.log("UUUUUU");
			let faculty = $("#faculty").val();
			let department = $("#department").val();
			//добавляем в cookie
			$.cookie("choose-department", department);
			$.cookie("choose-faculty", faculty);
			if (!faculty || !department)
				return alert("Заполните поля");

			let sendValue = JSON.stringify({faculty: faculty, department: department});

			let request = new XMLHttpRequest();
			//посылаем запрос на адрес "/getworkers"
			request.open("POST", "/get-workers", true);
			request.setRequestHeader("Content-Type", "application/json");
			request.addEventListener("load", function () {
				$('#usersdiv').hide();
				$('#usersdiv').html(request.response);
				$('#usersdiv').slideDown(500);
				setTimeout(resolve, 500);
			});
			request.send(sendValue);
		});
	}

	function getStructure() {
		return new Promise(function(resolve, reject) {
			let request = new XMLHttpRequest();
			//посылаем запрос на адрес "/structure.json"
			request.open("GET", "/structure.json", true);
			request.setRequestHeader("Content-Type", "application/json");
			request.addEventListener("load", function () {
				structure = JSON.parse(request.response);
				$("#faculty").attr("disabled", false);
				resolve();
			});
			request.send();
		});
	}
	function checkCookie(option) {
		return new Promise(function (resolve, reject) {
			debugger;
			let chooseFaculty = $.cookie("choose-faculty");
			let chooseDepartment = $.cookie("choose-department");
			let chooseUser = $.cookie("choose-user");
			console.log(chooseFaculty);
			console.log(chooseDepartment);
			console.log(chooseUser);
			console.log(option);
			if(chooseFaculty && option == 'faculty') {
				$("#faculty").val(chooseFaculty);
				changeFaculty();
			}
			if(chooseDepartment && chooseDepartment != 'null' && option != 'workers') {
				$("#department").val(chooseDepartment);
			}
			if($("#faculty").val() && $("#department").val()) {
				getWorkers().then(function (result) {
					let name = $('#worker option[data-value="' + chooseUser + '"]').val();
					console.log($('#worker option[data-value="' + chooseUser + '"]'));
					console.log("name!", name);
					if(name) {
						$("#name").val(name);
						getTableForVerify().then(function (result) {
							resolve();
						});
					} else {
						resolve();
					}
				});
			} else {
				resolve();
			}
		});
    }
});