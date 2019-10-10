$(document).ready(function() {
	$("#date").change(function() {
		console.log($('#date').val());
		let date = $('#date').val();
		let sendValue = JSON.stringify({date: date});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/getlogs", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$("#logs").html(request.response);
		});
		request.send(sendValue);
	});
});