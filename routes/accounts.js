var express = reqire('express');
var router = express.Router();

// this is /account
router
  .get('/', function(req, res, next) {
    // do something
    res.send('get account');
  })
  .get('/:id', function(req, res, next) {
    // get by id
  })
  .post('/', function(req, res, next) {
    // do something
    res.send('add account');
  })
  .delete('', function(req, res, next) {

  });

module.exports = router;