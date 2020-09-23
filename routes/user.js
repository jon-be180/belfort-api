var express = reqire('express');
var router = express.Router();
global.fetch = require('node-fetch');
var AmazonCognitoIdentity = require('amazon-cognito-identity');
var config = require('../config/cognito.js');

const poolData = {
    UserPoolId: config.cognito.userPoolId,
    ClientId: config.cognito.clientId
};
const userData = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// this is /account
router
  .get('/', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    
    if(password !== confirmPassword) {
        res.status(400);
        req.send('bad password confirmation');
    }

    const emailData = {
        Name: 'email',
        Value: email
    };

    const emailAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(emailData);

    userPool.signUp(email, password, [ emailAttribute], null, (err, data) => {
        if(err) {
            return console.error(err);
        }
        res.send(data.user);
    });

  });

  module.exports = router;