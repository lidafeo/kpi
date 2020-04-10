const express = require("express");

let handler = require('../handlers/handlers.js').changePps;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const router = express.Router();

let checkRight = require('../modules/check-right');

router.route('/add-pps')
    .get(handler.pageAddPps)
    .post(urlencodedParser, handler.addPps);

module.exports = router;