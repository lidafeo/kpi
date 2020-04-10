//проверка прав доступа к страницам
module.exports = function (right) {
    return function (req, res, next) {
        for(let i = 0; i < right.length; i++) {
            if(req.session.rights && req.session.rights.indexOf(right[i]) !== -1) {
                return next();
            }
        }
        res.status(404).render("error/404");
    }
};