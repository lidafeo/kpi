const express = require("express");

let handler = require('../handlers/handlers.js').changeKpi;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const router = express.Router();

let checkRight = require('../modules/check-right');

router.route('/add-kpi')
    .get(handler.pageAddKpi)
    .post(urlencodedParser, handler.addKpi);
router.route('/choice-kpi')
    .get(handler.pageChoiceKpi);
router.route('/edit-kpi')
    .get(handler.pageEditKpi)
    .post(urlencodedParser, handler.editKpi);
router.route('/delete-kpi')
    .post(urlencodedParser, handler.deleteKpi);

module.exports = router;
