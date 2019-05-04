//Преобразование даты
exports.dateToString = function dateToString(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	if(day < 10) day = "0" + day;
	if(month < 10) month = "0" + month;
	return day + "_" + month + "_" + year;
}

//преобразование времени
exports.timeToString = function timeToString(date) {
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	if(hours < 10) hours = "0" + hours;
	if(minutes < 10) minutes = "0" + minutes;
	if(seconds < 10) seconds = "0" + seconds;
	return hours + ":" + minutes + ":" + seconds;
}

//преобразование даты для ввода в HTML date
exports.dateForInput = function dateForInput(date) {
	let myDate = date.getDate();
	let myMonth = date.getMonth() + 1;
	let myYear = date.getFullYear();
	if(myDate < 10) myDate = "0" + myDate;
	if(myMonth < 10) myMonth = "0" + myMonth;
	return myYear + '-' + myMonth + '-' + myDate;
}