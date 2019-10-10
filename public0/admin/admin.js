let facultyArr = getCookie("faculty").split('.').join(' ').split('_');
$(document).ready(function() {
	for(let i = 0; i < facultyArr.length; i++)
		console.log(facultyArr[i]);
	getInfo();
	//изменение должности
	$('#position').change(function() {
		getInfo();
	});

	$('#faculty').change(function() {
		let chooseFaculty = $("#faculty option:selected").text();
		for(let i = 0; i < facultyArr.length; i++){
			if(facultyArr[i] == chooseFaculty){
				$('#department' + i).show();
				$('#department').val(i);
			}
			else $('#department' + i).hide();
		}
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
		console.log(getCookie('faculty0'));
		let str;
		for(let i = 0; i < facultyArr.length; i++)
			str +="<option>" + facultyArr[i] + "</option>";
		$('#faculty').html(str);
		$('#facultydiv').show();
		$("#department option:selected").text("");
		$('#departmentdiv').hide();
	}
	else {
		$('#facultydiv').show();
		let str;
		for(let i = 0; i < facultyArr.length; i++)
			str +="<option>" + facultyArr[i] + "</option>";
		$('#faculty').html(str);
		let chooseFaculty = $("#faculty option:selected").text();
		for(let i = 0; i < facultyArr.length; i++){
			if(facultyArr[i] == chooseFaculty) {
				$('#department' + i).show();
				$('#department').val(i);
			}
			else $('#department' + i).hide();
		}
		$('#departmentdiv').show();
	}
}

function getCookie(name) {
	let matches = document.cookie.match(new RegExp("(?:^|; )" + 
		name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}