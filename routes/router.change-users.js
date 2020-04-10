const express = require("express");

let handler = require('../handlers/handlers.js').changeUsers;

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended:false});
const router = express.Router();

let checkRight = require('../modules/check-right');

router.route('/delete-user')
    .get(handler.pageDeleteUser)
    .post(urlencodedParser, handler.deleteUser);
router.route('/add-user')
    .get(handler.pageAddUser)
    .post(urlencodedParser, handler.addUser);

module.exports = router;