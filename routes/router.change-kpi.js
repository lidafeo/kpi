const express = require("express");

let handler = require('../handlers/handlers.js').changeKpi;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const router = express.Router();

let checkRight = require('../modules/check-right');

router.route('/add-kpi')
    .get(handler.pageAddKpi)
    .post(urlencodedParser, handler.addKpi);
router.route('/delete-kpi')
    .get(handler.pageDeleteKpi)
    .post(urlencodedParser, handler.deleteKpi);
router.route('/edit-balls')
    .get(handler.pageEditBallsKpi)
    .post(urlencodedParser, handler.editBallsKpi);

router.post('/edit-balls-kpi', urlencodedParser, handler.editBallsKpi);

module.exports = router;
