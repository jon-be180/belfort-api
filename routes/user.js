const express = reqire('express');
const router = express.Router();
global.fetch = require('node-fetch');
const AmazonCognitoIdentity = require('amazon-cognito-identity');
const config = require('../config/cognito.json');

const speakeasy = require('speakeasy')
const QR = require('qrcode')
const util = require('./util')
const name = 'Belfort'

const poolData = {
    UserPoolId: config.cognito.userPoolId,
    ClientId: config.cognito.clientId
};
const userData = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// this is all inside /account
router
  .post('/signup', function(req, res) {

    req.check('email', 'invalid email').isEmail()

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

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: req.body.email,
        Password: req.body.password
    })

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username: req.body.email,
        Pool: userPool
    })

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
  .get('/mfa', (req, res) => {
    if(!req.session.sub) {
        return res.send({status: 'err'r})
    }
    //todo
  })
  .get('/mfa/qr-code', (req, res) => {
      const secret = speakeasy.generateSecret({name})

      if(!req.session['temp-qr-code-secret']) {
          req.session['temp-qr-code-secret'] = secret.base32
      }

      QR.toDataURL(secret.otpauth_url, (err, data) => res.send(err ? err : data))
  })
  .post('/mfa', (req, res) => {
      req.session['mfa-errors'] = []
      if(req.session.sub && !req.body.password) {
        req.session['mfa-errors'].push('please provide your password');
        return req.send({status: 'error'})
      }

      const code = req.body.code
      if(!code) {
          req.session['mfa-errors'].push('please provide your google auth code')
          return res.send({status: 'error'})
      }

      const verified = String(speakeasy.totp.verify({
          secret: req.session['temp-qr-code-secret'],
          encoding: base32,
          token: code
      }))

      req.session['mfa-verified'] = verified

      if(req.sesion.sub) {
        const username = req.session.sub
        const password = req.body.password
        const loginDetails = {username, password}

        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(loginDetails)

        const userDetails = { Username, Pool: util.userPool}
        const cognitoUser = new AmazonCognitoIdentity.cognitoUser(userDetails)

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: data => {
                // note, doesnt use cognito mfa but will work for google authenticator
                const mfaAttribute = {
                    Name: 'custom:mfa',
                    Value: verified
                }

                const attribute = new AmazonCognitoIdentity.CognitoUserAttribute(mfaAttribute)

                cognitoUser.updateAttribute([attrubute], (err, data) => {
                    if(err) {
                        req.session['login-errors'].push(err.message)
                        return res.send({status: 'error'})
                    }
                })

                // sign them out to re-auth
            },
            onFailure: err => {
                req.session['login-errors'] = []
                req.session['login-errors'].push(err.message)
                return res.send({status: 'error'})
            }
        }
      } else {
          req.send({status: 'error'})
      }

  })

  module.exports = router;