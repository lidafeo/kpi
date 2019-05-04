Date.prototype.toDateInputValue = (function() {
	let local = new Date(this);
	local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
	return local.toJSON().slice(0,10);
});

$(document).ready(function() {
	let date = new Date();
	date.setMonth(date.getMonth() - 6);
	$('#date1').val(date.toDateInputValue());
	$('#date2').val(new Date().toDateInputValue());
});
/*$(document).ready(function() {
	let checkKPI;
	$("body").on('click', "#implementation", function() {
		//получаем данные формы
		let radiobut = document.getElementsByName('chradio');
		let value;
		//определяем выбранное значение
		for( let i = 0; i < radiobut.length; i++) {
			if(radiobut[i].checked) value = radiobut[i];
		}
		checkKPI = value.value;
		console.log(checkKPI);
		body = $("#bodydiv").html();
		let sendValue = JSON.stringify({selectedValue: checkKPI});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/editkpi", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			console.log(request.response); //смотрим ответ сервера
			$("#bodydiv").html(request.response);
		});
		request.send(sendValue);
	});
});
*/
	//прослушвание нажатия кнопки изменения KPI типа 0
	/*
	$("body").on('click', "#submitedit0", function(e) {
		e.preventDefault();
		let file = document.getElementById("my_file");
		let myform = document.forms.editform;
		let form = new FormData();
		let request = new XMLHttpRequest();
		let upload_file = file.files[0];
		form.append("file", upload_file);
		form.append("selectedKpi", checkKPI);
		request.open("POST", "/upload", true);
		//request.setRequestHeader("Content-Type", "multipart/form-data");
		request.send(form);
		request.onload = function(ev) {
			console.log(request.response);
			//document.location = '/user';
			location.reload();
			if(request.response == 'err') alert('Пустой файл не может быть отправлен');
			else alert('Запрос отправлен');
		}
	});
	//прослушвание нажатия кнопки изменения KPI типа 1
	$("body").on('click', "#submitedit1", function(e) {
		e.preventDefault();
		let sendValue = JSON.stringify({value: $("#valueofkpi").val(), selectedKpi: checkKPI});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/sendvalue", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			console.log(request.response);
			location.reload();
			if(request.response == 'err') alert('Пустое значение не может быть отправлено');
			else alert('Запрос отправлен');
		});
		request.send(sendValue);
	});

	//прослушвание нажатия кнопки изменения KPI без отправления начальнику
	$("body").on('click', "#simpleedit", function(e) {
		e.preventDefault();
		let sendValue = JSON.stringify({value: $("#valueofkpi").val(), selectedKpi: checkKPI});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/editwithoutboss", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			console.log(request.response);
			location.reload();
			if(request.response == 'err') alert('Не удалось изменить значение KPI');
			else alert('Значение KPI изменено');
		});
		request.send(sendValue);
	});
	*/