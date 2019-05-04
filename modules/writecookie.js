exports.cookieKpi = function cookieKpi(res, docs) {
	let obj = {};
	for(let i = 0; i < docs.length; i++) {
		if(!docs[i].subtype) docs[i].subtype = "";
		let str = docs[i].section + '_' + docs[i].subtype;
		if(!obj[str]) obj[str] = [];
		obj[str].push(docs[i].number);
	}
	let arrId = [];
	let n = 0;
	for(key in obj) {
		obj[key].sort(function(a, b) {
			return a - b;
		});
		arrId.push(key);
		let id = "id_" + n;
		res.cookie(id, encodeURIComponent(obj[key].join("_")));
		n++;
	}
	res.cookie("idarr", arrId.join('.'));
	return obj;
}