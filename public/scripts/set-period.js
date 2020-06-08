$(document).ready(function() {
	$('#form-set-period').submit(function(e) {
		let date1 = $('#date1').val();
		let date2 = $('#date2').val();
		if(new Date(date2) <= new Date(date1)) {
			e.preventDefault();
			return $('#text').html("Вторая дата должна быть больше первой");
		}
		$('#text').html("");
	});
});