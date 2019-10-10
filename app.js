//подключаемые модули
const express = require("express");
const bodyParser = require("body-parser");

//const fileUpload = require("express-fileupload");
let credentials = require('./modules/credentials.js');
let routes = require("./modules/routes.js");

const app = express();

//запуск сервера
app.listen(2000, function() {
	console.log('Сервер запущен на http://localhost:2000;' + 
 ' нажмите Ctrl+C для завершения.')
});

app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret
}));

routes(app);

//Пользовательская страница 404
app.use(function(req, res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 - Не найдено');
});

//Пользовательская страница 500
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Ошибка сервера');
});
