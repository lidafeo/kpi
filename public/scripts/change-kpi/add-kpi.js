$(document).ready(function() {
	let num = 0;
	let countSlide = 1;
	let divCrit = $('#crit0').html();

	$('.addcrit').slick({
		infinite: false,
		arrows: false,
		swipe: false
	});
/*
	$('#form-send').submit(function(e) {
		//$('#crit' + num + ' #errorсrit').html('');
		//$("#next").css("border", "none");
		let check = true;
		//let inputClass = "#crit" + num + " ";
		/*
		if(!checkEmpty("#infokpi ")) {
			$('#error').html('<h4>Заполните данные о ПЭДе!</h4>');
			check = false;
		}
		else if(!checkFigure("#infokpi ")) {
			$('#error').html('<h4>Введите числа!</h4>');
			check = false;
		}
		else if(!checkEmpty(inputClass)) {
			$('#error').html('<h4>Заполните критерий!</h4>');
			$('#crit' + num + ' #errorсrit').html('<h4>Заполните поля!</h4>');
			check = false;
		}
		else if(!checkFigure(inputClass)) {
			$('#error').html('<h4>Заполните критерий!</h4>');
			$('#crit' + num + ' #errorсrit').html('<h4>Введите числа!</h4>');
			check = false;
		}
		else if(+$("#count").val() != num + 1) {
			$('#error').html('<h4>Заполните все критерии!</h4>');
			$('#next').css("border", "2px solid red");
			check = false;
		}
		if (this.checkValidity() === false) {
			check = false;
		}
		if(!check) {
			return e.preventDefault();
			//$('html, body').animate({scrollTop: 0}, 500);
		}
	});
*/
	//Изменение типа ПЭДа
	$("input[name='type']").change(function() {
		//если выбран 1 тип
		if($("input[value='1']").prop("checked")) {
			$('.hidden').hide();
		}
		else {
			$('.hidden').show();
			$('.addcrit').slick('slickGoTo', 0);
			$('#prev').hide();
			num = 0;
		}
	});

	//Изменение количества критериев
	$("#count").change(function() {
		let count = + $("#count option:selected").text();
		if(count != 1) $("#next").show();
		if(count == countSlide) return;
		if(count < countSlide) {
			//удаляем слайды
			for(let i = countSlide - 1; i >= count; i--) {
				$("#crit" + i).remove();
				$('.addcrit').slick('slickRemove', i);
			}
			if(count <= num) {
				num = count - 1;
				$("#next").hide();
			}
			if(count == 1) $("#prev").hide();
		}
		else {
			//добавляем слайды
			for(let i = countSlide; i < count; i++) {
				let crit = "#crit" + (i - 1);
				$(crit).after('<div id="crit' + i + '">' + divCrit + '</div>');
				$('#crit' + i + ' #critname').text("Критерий №" + (i + 1));
				if($("input[value='2']").prop("checked")) {
					$('#crit' + i +' .hidden').show();
				}

				$('.addcrit').slick('slickAdd', $('#crit' + i));
			}
			$("#next").show();
		}
		countSlide = count;
	});

	//изменили тип критерия
	$('form').on('change', '.typecriterion', function() {
		//Узнаем номер критерия
		//let n = $(this).attr('name').split('_')[1];
		let crit = "#crit" + num;
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
		let crit = "#crit" + num + " ";
		/*if(!checkEmpty(crit)) {
			$('#crit' + num + ' #errorсrit').html('<h4>Заполните поля!</h4>');
			return $('html, body').animate({scrollTop: $('#crit' + num + ' #errorсrit').offset().top},
			 500);
		}
		if(!checkFigure(crit)) {
			$('#crit' + num + ' #errorсrit').html('<h4>Введите числа!</h4>');
			return $('html, body').animate({scrollTop: $('#crit' + num + ' #errorсrit').offset().top},
			 500);
		}
		$('#crit' + num + ' #errorсrit').html('');
		 */
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

/*
function checkEmpty(inputClass) {
	$(inputClass + " input, " + inputClass + " textarea").css("border", "none");

	$(inputClass + " .notempty, " + inputClass + " .figure").each(function() {
		if($(this).val() != "")
			$(this).removeClass('empty_field');
		else 
			$(this).addClass('empty_field');
	});
	$(inputClass + ' .notempty:hidden, ' + inputClass + ' .figure:hidden').each(function() {
		$(this).removeClass('empty_field');
	});
	$(inputClass + ' .empty_field').css("border", "2px solid red");
	return $(inputClass + ' .empty_field').length == 0;
}

function checkFigure(inputClass) {
	$(inputClass + " input, " + inputClass + " textarea").css("border", "none");

	$(inputClass + " .figure").each(function() {
		if(/\D/.test($(this).val()))
			$(this).addClass('notfigure_field');
		else 
			$(this).removeClass('notfigure_field');
	});
	$(inputClass + ' .figure:hidden').each(function() {
		$(this).removeClass('notfigure_field');
	});
	$(inputClass + ' .notfigure_field').css("border", "2px solid red");
	return $(inputClass + ' .notfigure_field').length == 0;
}
 */