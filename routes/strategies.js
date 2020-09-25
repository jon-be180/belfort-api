const express = reqire('express')
const router = express.Router()
const aws = require('aws-sdk')

AWS.config.update(require('../config/db.json'))

const docClient = new AWS.DynamoDB.DocumentClient()


/**
 * Get all running gekim instances for the account
 *
 * @TODO complete
 *
 * Response: {
 *   id
 *   name
 *   status
 *   jsonLaunchSettings
 *   link-to-access
 * }
 *
 * Response Codes: 200, 404
 */
router.get('/', cors(corsOptions), (req, res, next) => {
    //TODO security authentication file?
    var docker = new Docker({host: 'http://gekim.be180.co.uk', port: 2375});
  
    var results = [];
  
    docker.listContainers(function (err, containers) {
      containers.forEach(function(containerInfo) {
        docker.getContainer(containerInfo.Id).inspect(function( err, data) {
          // this is shit as it only shows one
          results.push(data);
          res.send(results);
        });
      })
    });
  
  });

  router.post('/', (req, res) {
    // create a strategy
  })


  module.exports = router;