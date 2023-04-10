var express = require('express');
var router = express.Router();
var db = require('../modules/db');
var user = require('../models/users');
const { response } = require('express');

router.get('/', function(req, res, next) {
    res.json({
        message: "Welcom To Vynsign",
        redirectUrl: {
            management: '/management', 
            concept: '/concept',
            draft: '/draft',
            request: '/request',
            sent: '/sent',
            profile: '/users/profile'
        }
    })
});

module.exports = router;