function getSymb() {
	var abc = "abcdefghijklmnopqrstuvwxyz";
	return abc[Math.floor(Math.random() * abc.length)];
}

exports.generateFileName = function (login) {
	let date = new Date();
	return login.split('.').join('') +
		getSymb() + date.getMonth() +
		getSymb() + date.getDate() +
		getSymb() + date.getFullYear() +
		getSymb() + date.getMinutes() +
		getSymb() + date.getSeconds() +
		getSymb() + date.getHours() +
		getSymb() + date.getMilliseconds();
};

//Формирование массива значений из массива объектов одного ключа
exports.createArrayOfKeyValues = function (arrObj, key) {
	let arr = [];
	arr.push(arrObj[0][key]);
	for(let i = 1; i < arrObj.length; i++) {
		if(arrObj[i - 1][key] != arrObj[i][key])
			arr.push(arrObj[i][key]);
	}
	return arr;
};