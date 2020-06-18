const express = require("express");

let handler = require('../handlers/handlers.js').pps;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const jsonParser = express.json();

const router = express.Router();

let checkRight = require('../modules/check-right');

router.route('/get-my-score')
    .all(checkRight(["get_my_score"]))
    .get(handler.pageGetScores);
router.route('/add-value-kpi')
    .all(checkRight(["add_value_of_kpi"]))
    .get(handler.pageAddValueKpi)
    .post(handler.addValueKpi);
router.route('/get-values-kpi')
    .all(checkRight(["get_my_values_of_kpi"]))
    .get(handler.pageGetValuesKpi);
router.route('/val/:valId')
    .all(checkRight(["get_my_values_of_kpi"]))
    .get(handler.pageGetValue);

router.post('/choose-kpi', checkRight(["add_value_of_kpi"]), jsonParser, handler.chooseKpiForAddValue);
router.post('/change-field-val', checkRight(["get_my_values_of_kpi"]), jsonParser, handler.changeFieldVal);
router.post('/delete-val', checkRight(["get_my_values_of_kpi"]), urlencodedParser, handler.deleteVal);

//app.post('/edit-kpi', jsonParser, user.postChooseKpiForAddValue);

module.exports = router;