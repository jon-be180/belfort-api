const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk')

AWS.config.update(require('../config/db.json'))

const docClient = new AWS.DynamoDB.DocumentClient()

const session = 'not sure yet how this works'

/*
 * TODO exchange account api
 * this must have a wallet address option for uk tax purposes
 */

// this is /account
router
  .get('/', function(req, res, next) {
    docClient.get({TableName: 'accounts', Key: {UserID: session.userId}}, function(err, data) {
        if(err) {
          req.send('error')
        } else {
          req.send(data)
        }
    })
  })
  .get('/:id', function(req, res, next) {
    // get by id
    docClient.get({TableName: 'accounts', Key: {AccountId: req.body.id, UserId: session.userId}}, function(err, data) {
      if(err) {
        req.send('error')
      } else {
        req.send(body)
      }
    })
  })
  .post('/', function(req, res, next) {
    // do something
    res.send('add account');
  })
  .delete('', function(req, res, next) {

  });

module.exports = router;