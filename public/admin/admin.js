$(document).ready(function() {
	getInfo();
	//изменение должности
	$('#position').change(function() {
		getInfo();
	});

	$('#add').click(function(e) {
		let name = $("#name").val();
		if(!$("#name").val() || !$("#login").val() || !$("#password").val()) {
			e.preventDefault();
			$('#error').html('<h4>Заполните все поля!</h4>');
			$('html, body').animate({scrollTop: 0}, 500);
		}
	});
	//document.querySelector('#submit').click();
});

function getInfo() {
	let position = $("#position option:selected").text();
	if(position == "Проректор" || position == "Администратор" || position == "ПФУ") {
		$("#department option:selected").text("");
		$("#faculty option:selected").text("");
		$('#departmentdiv').hide();
		$('#facultydiv').hide();
	}
	else if(position == "Декан") {
		let request = new XMLHttpRequest();
		request.open("POST", "/getfaculty", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			let faculty = request.response.split('_,');
			let str = "";
			for(let i = 0; i < faculty.length; i ++)
				str +="<option>" + faculty[i] + "</option>";
			$('#faculty').html(str);
		});
		request.send();
		$('#facultydiv').show();
		$("#department option:selected").text("");
		$('#departmentdiv').hide();
	}
	else {
		let request = new XMLHttpRequest();
		request.open("POST", "/getdepartment", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			let department = request.response.split('_,');
			let str = "";
			for(let i = 0; i < department.length; i ++)
				str +="<option>" + department[i] + "</option>";
			$('#department').html(str);
		});
		request.send();
		$('#facultydiv').hide();
		$("#faculty option:selected").text("");
		$('#departmentdiv').show();
	}
}