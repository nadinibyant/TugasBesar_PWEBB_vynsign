var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
