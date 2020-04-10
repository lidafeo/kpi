const express = require("express");

let handler = require('../handlers/handlers.js').changeRoles;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const router = express.Router();

let checkRight = require('../modules/check-right');

router.route('/add-role')
    .get(handler.pageAddRole)
    .post(urlencodedParser, handler.addRole);

module.exports = router;