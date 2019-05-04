$(document).ready(function() {
	let num = 0;
	$('.addcrit').slick({
		infinite: false,
		arrows: false,
		swipe: false
	});

	$('#add').click(function(e) {
		//$("input").css("border", "none");
		let bool = true;
		if(+$("#count").val() != num + 1 || !checkEmpty(num)) {
			$('#error').html('<h4>Заполните все критерии!</h4>');
			bool = false;
		}
		else if(!checkInfoKPI()) {
			$('#error').html('<h4>Заполните данные о ПЭДе!</h4>');
			bool = false;
		}
		else if(/\D/.test($("#number").val())) {
			$('#error').html('<h4>Поле номер должно быть числом!</h4>');
			//$('html, body').animate({scrollTop: $('#number').position().top}, 500);
			$('#number').css("border", "2px solid red");
			bool = false;
		}
		if(!bool) {
			e.preventDefault();
			$('html, body').animate({scrollTop: 0}, 500);
		}
		/*
		let arr = ["#g1", "#g2", "#g3", "#g4", "#g5", "#g6"];
		for(let i = 0; i < arr.length; i++) {
			if(/\D/.test($(arr[i]).val()))  {
				e.preventDefault();
				$('#error').html('<h4>Оценка должна быть числом!</h4>');
				$('html, body').animate({scrollTop: $(arr[i]).position().top}, 500);
				$(arr[i]).css("border", "2px solid red");
				return;
			}
		}
		*/
	});

	//Изменение типа ПЭДа
	$("input[name='type']").change(function() {
		//если выбран 1 тип
		if($("input[value='1']").prop("checked")) {
			$('.hidden').hide();
		}
		else {
			$('.hidden').show();
			$('.addcrit').slick('slickGoTo', 0);
			num = 0;
		}
	});

	//Изменение количества критериев
	$("#count").change(function() {
		num = 0;
		$('.n').hide();
		$('.a').hide();
		$('.b').hide();
		let div = $("#crit0").html();
		$('.addcrit').html('<div id="crit0">' + div + '</div>')
		let count = + $("#count option:selected").text();
		if(count != 1) $("#next").show();
		//$('.addcrit').slick('unslick');
		for(let i = 1; i < count; i++) {
			let crit = "#crit" + (i - 1);
			$(crit).after('<div id="crit' + i + '">' + div + '</div>');
			//$('#crit' + i).hide();
			$('#crit' + i + ' #critname').text("Критерий №" + (i + 1));

			$('#crit' + i + ' #description').attr("name", "description_" + i);
			$('#crit' + i + ' .typecriterion').attr("name", "type_" + i);
			$('#crit' + i + ' #namecriterion').attr("name", "namecriterion_" + i);
			for(let j = 1; j <= 6; j++) {
				$('#crit' + i + ' #g' + j).attr("name", "g" + j + "_" + i);
			}
		}
		/*
		$('.addcrit').slick({
			infinite: false,
			arrows: false,
			swipe: false
		});
		*/
	});

	//изменили тип критерия
	$('form').on('change', '.typecriterion', function() {
		//Узнаем номер критерия
		let n = $(this).attr('name').split('_')[1];
		let crit = "#crit" + n;
		if($(this).val() == "Не менее n") {
			$(crit + ' .n').show();
			$(crit + ' .a').hide();
			$(crit + ' .b').hide();
		}
		if($(this).val() == "От a до b") {
			$(crit + ' .n').hide();
			$(crit + ' .a').show();
			$(crit + ' .b').show();
		}
		if($(this).val() == "Да/Нет") {
			$(crit + ' .n').hide();
			$(crit + ' .a').hide();
			$(crit + ' .b').hide();
		}
	});

	//нажали на кнопку "следующий критерий"
	$('#next').click(function(e) {
		e.preventDefault();
		if(!checkEmpty(num))
			return $('#crit' + num + ' #errorсrit').html('<h4>Заполните поля!</h4>');
		$('#crit' + num + ' #errorсrit').html('');
		if(+$("#count").val() != num + 1) {

			$('#prev').show();
			$('.addcrit').slick('slickNext');
			num++;
		}
		if(+$("#count").val() == num + 1)
			$('#next').hide();
	});

	//нажали на кнопку "предыдущий критерий"
	$('#prev').click(function(e) {
		e.preventDefault();
		if(num != 0) {
			$('#next').show();
			$('.addcrit').slick('slickPrev');
			num--;
		}
		if(num == 0)
			$('#prev').hide();
	});
});

function checkEmpty(n) {
	let crit = "#crit" + n + " ";
	$(crit + " input").css("border", "none");
	$(crit + " textarea").css("border", "none");
	let valid = true;
	let firstEl;

	//let arr = ["#g1", "#g2", "#g3", "#g4", "#g5", "#g6", "#namecriterion"];
	if($(crit + " .notempty:input:visible, " + crit + " .figure:input:visible").length != 0) {
		$(crit + " .notempty:input:visible").css("border", "2px solid red");
		valid = false;
	}
	/*console.log(arr);
	for(let i = 0; i < arr.length; i++) {
		if(!arr[i].val().trim()) {
			valid = false;
			arr[i].css("border", "2px solid red");
		}
	}*/
	if(!$(crit + "#description").val() && $("#radio2").prop("checked")) {
		valid = false;
		$(crit + "#description").css("border", "2px solid red");
	}
	if($(crit + ".typecriterion").val() == "Не менее n" && !$(crit + "#n").val()) {
		valid = false;
		$(crit + "#n").css("border", "2px solid red");
	}
	if($(crit + ".typecriterion").val() == "От a до b") {
		if(!$(crit + "#a").val()) {
			valid = false;
			$(crit + "#a").css("border", "2px solid red");
		}
		if(!$(crit + "#b").val()) {
			valid = false;
			$(crit + "#b").css("border", "2px solid red");
		}
	}
	return valid;
}

function checkInfoKPI() {
	let bool = true;
	$("#infokpi input").css("border", "none");
	$("#infokpi textarea").css("border", "none");
	let arr = ["#name", "#inputsection", "#number", "#desc"];
	for(let i = 0; i < arr.length; i++) {
		console.log($(arr[i]).val());
		if(!$(arr[i]).val()) {
			$(arr[i]).css("border", "2px solid red");
			bool = false;
		}
		console.log(bool);
	}
	return bool;
}