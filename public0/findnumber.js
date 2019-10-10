$(document).ready(function() {
	//изменение отдела
	$('#section').change(function() {
		let section = $("#section option:selected").text();
		let arrStr = getCookie('idarr').split('.');
		let subtype = [];
		let arrNumber;
		for(let i = 0; i < arrStr.length; i++) {
			let sec = arrStr[i].split('_')[0];
			if(arrStr[i].split('_')[0] == section){
				subtype.push(arrStr[i].split('_')[1]);
				if(subtype[0] == arrStr[i].split('_')[1])
					arrNumber = getCookie('id_' + i).split('_');
			}
		}
		if(!subtype[0]) $('#subtype').hide();
		else $('#subtype').show();
		arrForOption(subtype, 'subtype');
		arrForOption(arrNumber, 'number');
	});
	//изменение подтипа
	$('#subtype').change(function() {
		let section = $("#section option:selected").text();
		let subtype = $("#subtype option:selected").text();
		let arrStr = getCookie('idarr').split('.');
		let arrNumber;
		for(let i = 0; i < arrStr.length; i++) {
			if(arrStr[i].split('_')[0] == section && arrStr[i].split('_')[1] == subtype) {
				arrNumber = getCookie('id_' + i).split('_');
				break;
			}
		}
		arrForOption(arrNumber, 'number');
	});
});
//возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
	let matches = decodeURIComponent(document.cookie).match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

function arrForOption(arr, nameOpt) {
	let strOpt = "";
	for(let i = 0; i < arr.length; i ++)
		strOpt +="<option>" + arr[i] + "</option>";
	$('#' + nameOpt).html(strOpt);
}