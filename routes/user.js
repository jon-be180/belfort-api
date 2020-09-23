const express = reqire('express');
const router = express.Router();
global.fetch = require('node-fetch');
const AmazonCognitoIdentity = require('amazon-cognito-identity');
const config = require('../config/cognito.json');

const poolData = {
    UserPoolId: config.cognito.userPoolId,
    ClientId: config.cognito.clientId
};
const userData = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// this is /account
router
  .post('/signup', function(req, res) {
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

  })
  .post('/login', (req, res) => {
    const loginDetails = {
        Username: req.body.email,
        Password: req,body.password
    }

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(loginDetails)

    const userDetails = {
        Username: req.body.email,
        Pool: userPool
    }

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails)

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: data => {
            // todo
          res.send({status: 'success'})
        },
        onFailure: err => {
          req.send({status: 'error', reason: err.message})
        }
    })

  })

  module.exports = router;