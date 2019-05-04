$(document).ready(function() {

	$('#submit').click(function(e) {
		e.preventDefault();
		let section = $("#section option:selected").text();
		let subtype = $("#subtype option:selected").text();
		let number = $("#number option:selected").text();

		let sendValue = JSON.stringify({section: section, subtype: subtype, number: number});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/editkpi", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			console.log(request.response); //смотрим ответ сервера
			$('#tablekpi').html(request.response);
		});
		request.send(sendValue);
	});

	$("body").on('click', "#plus", function() {
		let section = $("#section option:selected").text();
		let subtype = $("#subtype option:selected").text();
		let number = $("#number option:selected").text();
		let name;
		if(subtype) name = section[0] + '.' + subtype[0] + '.' + number;
		else name = section[0] + '.' + number;

		let sendValue = JSON.stringify({name: name});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/plus", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			console.log(request.response); //смотрим ответ сервера
			$('#plusdiv').html(request.response);
			$('#name').val(name);
		});
		request.send(sendValue);
		$('#plus').hide();
	});

	$("body").on('click', "#addkpi", function(e) {
		e.preventDefault();
		let file = document.getElementById("file");
		let myform = document.forms.form1;
		let form = new FormData();
		let request = new XMLHttpRequest();
		let upload_file = file.files[0];
		form.append("file", upload_file);
		let value;
		if ($('#radio').val()) {
			let radiobut = document.getElementsByName('radio');
			console.log(radiobut);
			//определяем выбранное значение
			for( let i = 0; i < radiobut.length; i++) {
				if(radiobut[i].checked) value = radiobut[i];
			}
			form.append("radio", value.value);
		}
		form.append("name", $('#name').val());
		form.append("date", $('#datekpi').val());
		form.append("value", $('#value').val());
		form.append("text", $('#text').val());
		request.open("POST", "/upload", true);
		//request.setRequestHeader("Content-Type", "multipart/form-data");
		request.send(form);
		request.onload = function(ev) {
			console.log(request.response);
			//document.location = '/user';
			//location.reload();
			if(request.response == 'err') 
				alert('Обязательные поля: значение + файл или текст для подтверждения + дата реализации');
			else document.querySelector('#submit').click();
		}
	});

	document.querySelector('#submit').click();
});