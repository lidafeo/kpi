$(document).ready(function() {

	//нажатие на кнопку
	$('#submit').click(function(e) {
		e.preventDefault();
		let section = $("#section option:selected").text();
		let subtype = $("#subtype option:selected").text();
		let number = $("#number option:selected").text();
		let name = $("#name").val();

		let sendValue = JSON.stringify({section: section, subtype: subtype, number: number,
			name: name});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/verify", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			console.log(request.response); //смотрим ответ сервера
			$('#tablekpi').html(request.response);
		});
		request.send(sendValue);
	});
	$("body").on('mousedown', "#name", function(e) {
		$("#name").val("");
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
				let obj = {id: id, comment: comment};
				incorrectKpi.push(obj);
			}
		}
		let sendValue = JSON.stringify({kpi: incorrectKpi});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/invalid", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			console.log(request.response); //смотрим ответ сервера
			document.querySelector('#submit').click();
		});
		request.send(sendValue);
	});
	//document.querySelector('#submit').click();
});