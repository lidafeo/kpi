$("body").on('click', "#date", function(e) {
	//посылаем запрос на адрес "/editkpi"
	let date1 = $('#date1').val();
	let date2 = $('#date2').val();
	let url = "/mypage?date1=" + date1 + "&date2=" + date2;
	request.open("GET", url, true);
	request.setRequestHeader("Content-Type", "application/json");
	request.addEventListener("load", function() {
		console.log(request.response); //смотрим ответ сервера
		//$(document).html(request.response);
		//$('#name').val(name);
	});
	//$('#plus').show();
	//$('#plusdiv').load('form.html');
});