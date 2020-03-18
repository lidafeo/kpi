$(document).ready(function() {
	let currRef;
	$('#submit').click(function(e) {
		e.preventDefault();
		let section = $("#section option:selected").text();
		let subtype = $("#subtype option:selected").text();
		let number = $("#number option:selected").text();

		let sendValue = JSON.stringify({section: section, subtype: subtype, number: number});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/edit-kpi", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$('#tablekpi').html(request.response);
		});
		request.send(sendValue);
	});

	$("body").on('click', "#plus", function() {
		$('#plusdiv').show();
		$('#plus').hide();
	});
	$("body").on('click', ".ref", function(e) {
		e.preventDefault();
		let elem = $(this).html();
		currRef = this;
		document.cookie = "choosekpi=" + elem;
		let sendValue = JSON.stringify({name: elem});
		let request = new XMLHttpRequest();
		//посылаем запрос на адрес "/editkpi"
		request.open("POST", "/edit-kpi", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", function() {
			$('#tablekpi').html(request.response);
			$('#plusdiv').hide();
		});
		request.send(sendValue);
	});
	$("body").on('click', "#addkpi", function(e) {
		e.preventDefault();
		let file = document.getElementById("file");
		let myform = document.forms.form1;
		let form = new FormData();
		let request = new XMLHttpRequest();
		let upload_file = file.files[0];
		form.append("file", upload_file);
		let value;
		if ($('#radio').val()) {
			let radiobut = document.getElementsByName('radio');
			//определяем выбранное значение
			for( let i = 0; i < radiobut.length; i++) {
				if(radiobut[i].checked) value = radiobut[i];
			}
			form.append("radio", value.value);
		}
		form.append("name", getCookie("choosekpi"));
		form.append("date", $('#datekpi').val());
		form.append("value", $('#value').val());
		form.append("text", $('#text').val());
		request.open("POST", "/upload", true);
		//request.setRequestHeader("Content-Type", "multipart/form-data");
		request.onload = function(ev) {
			//document.location = '/user';
			//location.reload();
			if(request.response == 'err') 
				alert('Обязательные поля: значение + файл или текст для подтверждения + дата реализации');
			else $(currRef).click();
		};
		request.send(form);
	});


	(function() {
		let ul = document.querySelectorAll('.treeCSS > li:not(:only-child) ul, .treeCSS ul ul');
		for( let i = 0; i < ul.length; i++) {
			let div = document.createElement('div');
			div.className = 'drop dropM';
			div.innerHTML = "+";
			ul[i].parentNode.insertBefore(div, ul[i].previousSibling);
			div.onclick = function() {
				this.innerHTML = (this.innerHTML == '+' ? '-' : '+');
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