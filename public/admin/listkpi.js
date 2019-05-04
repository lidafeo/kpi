$(document).ready(function() {
	$('#section').change(function() {
		let section = $("#section option:selected").text();
		console.log(document.cookie);
	});
});

//возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}