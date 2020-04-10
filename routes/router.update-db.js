const express = require("express");

let handler = require('../handlers/handlers.js').updateWithExcel;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const router = express.Router();

let checkRight = require('../modules/check-right');


router.route('/past-kpi')
    .get(handler.pageAddPastKpi)
    .post(urlencodedParser, handler.addPastKpi);
router.route('/add-users-from-file1')
    .get(handler.pageAddUsersFromFile1)
    .post(urlencodedParser, handler.addUsersFromFile1);
router.route('/add-users-from-file2')
    .get(handler.pageAddUsersFromFile2)
    .post(urlencodedParser, handler.addUsersFromFile2);
router.route('/update-structure')
    .get(handler.pageUpdateStructure)
    .post(urlencodedParser, handler.updateStructure);


module.exports = router;