$(document).ready(function() {
	$('#sub').click(function(e) {
		let date1 = $('#date1').val();
		let date2 = $('#date2').val();
		if(!date1 || !date2) {
			e.preventDefault();
			return $('#text').html("Установите значения");
		}
		if(new Date(date2) <= new Date(date1)) {
			e.preventDefault();
			return $('#text').html("Вторая дата должна быть больше первой");
		}
		$('#text').html("");
	});
});