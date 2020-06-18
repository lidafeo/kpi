const express = require("express");

let handler = require('../handlers/handlers.js').changeStructure;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const router = express.Router();

let checkRight = require('../modules/check-right');

router.route('/change-department')
    .get(handler.pageChangeDepartment)
    .post(urlencodedParser, handler.changeDepartment);

router.route('/change-faculty')
    .post(urlencodedParser, handler.changeFaculty);

module.exports = router;