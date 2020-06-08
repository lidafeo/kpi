$(document).ready(function() {

	let currRef;
	$('#submit').click(function(e) {
		e.preventDefault();
		let section = $("#section option:selected").text();
		let subtype = $("#subtype option:selected").text();
		let number = $("#number option:selected").text();

		let sendValue = JSON.stringify({section: section, subtype: subtype, number: number});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/pps/choose-kpi"
		request.open("POST", "/pps/choose-kpi", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$('#tablekpi').html(request.response);
		});
		request.send(sendValue);
	});

	$("body").on('click', "#plus", function() {
		$('#plus').hide();
		$('#plusdiv').show();
	});

	$("body").on('click', ".ref", function(e) {
		e.preventDefault();
		let elem = $(this).html();
		currRef = this;
		document.cookie = "choosekpi=" + elem;
		let sendValue = JSON.stringify({name: elem});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/pps/choose-kpi"
		request.open("POST", "/pps/choose-kpi", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$('#tablekpi').html(request.response);
			$('#plusdiv').hide();
		});
		request.send(sendValue);
	});

	$("body").on('submit', "#formAddKpi", function(e) {
		e.preventDefault();
		$('#error').text("");
		if (!checkValidForm(this)) {
			return;
		}
		let file = document.getElementById("file");
		let myform = document.forms.form1;
		let form = new FormData();
		let request = new XMLHttpRequest();
		let upload_file = file.files[0];
		form.append("file", upload_file);
		let value;
		let radiobut = document.getElementsByName('criterion');
		console.log(radiobut);
		if(radiobut.length) {
			//определяем выбранное значение
			for (let i = 0; i < radiobut.length; i++) {
				if (radiobut[i].checked)
					value = radiobut[i];
			}
			form.append("criterion", value.value);
		}

		form.append("name", getCookie("choosekpi"));
		form.append("date", $('#date-kpi').val());
		form.append("value", $('#value').val());
		form.append("text", $('#text').val());
		form.append("link", $('#link').val());
		request.open("POST", "/pps/add-value-kpi", true);
		//request.setRequestHeader("Content-Type", "multipart/form-data");
		request.onload = function(ev) {
			let response = JSON.parse(request.response);
			console.log(response);
			$("#error").html("");
			if(response.err)
				$("#error").html(response.err);
			else $(currRef).click();
		};
		request.send(form);
	});

	$("body").on("input", '#text, #file', function (e) {
		if(!$('#formAddKpi').hasClass('was-validated')) {
			return;
		}
		let elText = $("#text")[0];
		elText.setCustomValidity("");
		$("#text").removeClass("is-invalid");

		let elFile = $("#file")[0];
		elFile.setCustomValidity("");
		$("#file").removeClass("is-invalid");
		$('#error').text("");

		if (!$("#text").val() && !$("#file").val()) {
			$("#text").addClass("is-invalid");
			let newElText = $("#text")[0];
			newElText.setCustomValidity("Invalid field");

			$("#file").addClass("is-invalid");
			let newElFile = $("#file")[0];
			newElFile.setCustomValidity("Invalid field");

			$('#error').text("Необходимо подтвердить выполнение пояснительной запиской, либо файлом");
		}
	});

	$("body").on("input", '#date-kpi', function (e) {
		if(!$('#formAddKpi').hasClass('was-validated')) {
			return;
		}
		let elText = $("#date-kpi")[0];
		elText.setCustomValidity("");
		$("#date-kpi").removeClass("is-invalid");
		$('#error').text("");

		if (new Date($("#date-kpi").val()) >= new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate() + 1)) {
			$("#date-kpi").addClass("is-invalid");
			let newElText = $("#date-kpi")[0];
			newElText.setCustomValidity("Invalid field");

			$('#error').text("Дата реализации не может быть позже сегодняшней даты");
		}
	});

	$('.ref').on('click', function(e){
		$('html,body').stop().animate({ scrollTop: $('#tablekpi').offset().top }, 500);
		e.preventDefault();
	});
/*
	(function() {
		'use strict';
		window.addEventListener('load', function() {
			// Fetch all the forms we want to apply custom Bootstrap validation styles to
			let forms = document.getElementsByClassName('needs-validation');
			// Loop over them and prevent submission
			let validation = Array.prototype.filter.call(forms, function(form) {
				form.addEventListener('submit', function(event) {
					if (form.checkValidity() === false) {
						event.preventDefault();
						event.stopPropagation();
					}
					form.classList.add('was-validated');
				}, false);
			});
		}, false);
	})();
*/
	(function() {
		let ul = document.querySelectorAll('.treeCSS > li:not(:only-child) ul, .treeCSS ul ul');
		for( let i = 0; i < ul.length; i++) {
			let div = document.createElement('div');
			div.className = 'drop dropM';
			div.innerHTML = '<img src="/img/icons/dash-square.svg" alt="скрыть" width="18px">';
			ul[i].parentNode.insertBefore(div, ul[i].previousSibling);
			div.onclick = function() {
				this.innerHTML = (this.innerHTML == '<img src="/img/icons/dash-square.svg" alt="скрыть" width="18px">' ? '<img src="/img/icons/plus-square.svg" alt="скрыть" width="18px">' : '<img src="/img/icons/dash-square.svg" alt="скрыть" width="18px">');
				this.className = (this.className == 'drop' ? 'drop dropM' : 'drop');
			}
		}
	})();
});
function getCookie(name) {
	let matches = document.cookie.match(new RegExp("(?:^|; )" + 
		name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

function checkValidForm(form) {
	let check = true;
	if (form.checkValidity() === false) {
		check = false;
	}
	let elText = $("#text")[0];
	elText.setCustomValidity("");
	$("#text").removeClass("is-invalid");

	let elFile = $("#file")[0];
	elFile.setCustomValidity("");
	$("#file").removeClass("is-invalid");

	let elDate = $("#date-kpi")[0];
	elFile.setCustomValidity("");
	$("#date-kpi").removeClass("is-invalid");

	$('#error').text("");
	if (!$("#text").val() && !$("#file").val()) {
		$("#text").addClass("is-invalid");
		$("#file").addClass("is-invalid");

		$("#text")[0].setCustomValidity("Invalid field");
		$("#file")[0].setCustomValidity("Invalid field");

		$('#error').text("Необходимо подтвердить выполнение пояснительной запиской, либо файлом");
		check = false;
	}
	if (check && new Date($("#date-kpi").val()) >= new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate() + 1)) {
		$("#date-kpi").addClass("is-invalid");
		$("#date-kpi")[0].setCustomValidity("Invalid field");

		$('#error').text("Дата реализации не может быть позже сегодняшней даты");
		check = false;
	}
	$('#file-invalid-feedback').text('');
	if(!validateSize($("#file")[0], 1)) {
		$("#file").addClass("is-invalid");
		$("#file")[0].setCustomValidity("Invalid field");

		$('#file-invalid-feedback').text('Размер файла не должен быть больше 1 Мб');
		check = false;
	}
	form.classList.add('was-validated');
	return check;
}

function validateSize(fileInput, maxSize) {
	let fileObj = fileInput.files[0];
	let size = fileObj && fileObj.size ? fileObj.size : 0;
	if(size > maxSize * 1024 * 1024){
		return false;
	}
	return true;
}