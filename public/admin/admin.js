$(document).ready(function() {

	let facultyArr = JSON.parse($.cookie('faculty'));

	getInfo();

	//изменение должности
	$('#position').change(function() {
		getInfo();
	});

	//изменение факультета
	$("body").on('change', "#faculty", function() {
		let chooseFaculty = $("#faculty option:selected").text();
		for(let i = 0; i < facultyArr.length; i++){
			if(facultyArr[i] == chooseFaculty){
				$('#department' + i).show();
				$('#department' + i).attr("disabled", false);
				$('#department').val(i);
			}
			else {
				$('#department' + i).hide();
				$('#department' + i).attr("disabled", true);
			}
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


	function getInfo() {
		let position = $("#position option:selected").text();
		if(position == "Проректор" || position == "Администратор" || position == "ПФУ") {
			$("#numdepartment").val(0);
			//$("#department" + $("#numdepartment").val() + " option:selected").text("");
			$("#faculty option:selected").text("");
			$('#departmentdiv').hide();
			$('#facultydiv').hide();
			$("#faculty").attr("disabled", true);
			for(let i = 0; i < facultyArr.length; i++)
				$("#department" + i).attr("disabled", true);
		}
		else if(position == "Декан") {
			let str;
			for(let i = 0; i < facultyArr.length; i++){
				str +="<option>" + facultyArr[i] + "</option>";
				$("#department" + i).attr("disabled", true);
			}
			$('#faculty').html(str);
			$('#facultydiv').show();
			$("#faculty").attr("disabled", false);
			$("#numdepartment").val(0);
			//$("#department" + $("#numdepartment").val() + " option:selected").text("");
			$('#departmentdiv').hide();
		}
		else {
			$('#facultydiv').show();
			$("#faculty").attr("disabled", false);
			let str;
			for(let i = 0; i < facultyArr.length; i++)
				str +="<option>" + facultyArr[i] + "</option>";
			$('#faculty').html(str);
			let chooseFaculty = $("#faculty option:selected").text();
			for(let i = 0; i < facultyArr.length; i++){
				if(facultyArr[i] == chooseFaculty) {
					$('#department' + i).show();
					$('#department').val(i);
					$("#department" + i).attr("disabled", false);
				}
				else {
					$('#department' + i).hide();
					$("#department" + i).attr("disabled", true);
				}
			}
			$("#numdepartment").val(1);
			$('#departmentdiv').show();
		}
	}
});