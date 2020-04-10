let writeLogs = require('../modules/logs').log;
let writeErrorLogs = require('../modules/logs').error;

//страница выбора действий
exports.pageChoiceAction = function(req, res) {
    res.render('choice-action', {infoUser: req.session, pageName: '/actions'});
};