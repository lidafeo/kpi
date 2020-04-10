//Отправка страницы 404
exports.notFound = function(req, res) {
    res.status(404).render('error/404');
};