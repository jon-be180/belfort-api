const express = reqire('express')
const router = express.Router()
const aws = require('aws-sdk')

AWS.config.update(require('../config/db.json'))

const docClient = new AWS.DynamoDB.DocumentClient()

/**
 * Lists all the trades by the authorised user 
 * Note: moodified to support uk gov crypto reporting 
 *       rules, share reporting not specifically added 
 *       but might inherit the same requirements
 *
 * Request: {
 *   isActive: 1 or 0
 * }
 *
 * type of tokens YES
 * date you disposed of them YES
 * number of tokens you’ve disposed of YES
 * number of tokens you have left (done with actions)
 * value of the tokens in pound sterling YES
 * bank statements and wallet addresses YES
 * a record of the pooled costs before and after you disposed of them (TODO - https://www.gov.uk/tax-sell-shares/same-company)
 *
 * Response: {
 *   ID
 *   ExchangeAccountID
 *   TradeSystemID
 *   pair
 *   isActive
 *   direction
 *   size
 *   assetName
 *   reasons
 *   price
 *   margin
 *   date
 * }
 *
 * Response Codes: 200
 */
router.get('/trades', cors(corsOptions), (req, res, next) => {

    // this makes me feel ill...
    db.all('SELECT Trades.*, TradeSystems.name as systemName, ExchangeAccounts.name as exchangeAccountName FROM Trades JOIN TradeSystems ON (TradeSystems.ID = Trades.TradeSystemID) JOIN ExchangeAccounts ON (ExchangeAccounts.ID = Trades.ExchangeAccountID)', (err, results) => {
  
     if(err) {
        res.send(err);
      } else {
        res.send(results);
      }
    });
  
  });

  /**
 * Record an open trade on your account
 *
 * Request: { 
 *   ExchangeAccountID
 *   TradeSystemID
 *   pair
 *   isActive
 *   direction
 *   size
 *   assetName
 *   reasons
 *   price
 *   margin
 *   date
 * } 
 *
 * Response: {
 *   success: true/false
 * }
 *
 * Response Codes: 200, 404
 */
router.post('/trade', cors(corsOptions), (req, res, next) => {

    const sql = 'INSERT INTO Trades (ExchangeAccountID, TradeSystemID, pair, isActive, direction, size, assetName, reasons, price, margin, date) VALUES ($ExchangeAccountID, $TradeSystemID, $pair, $isActive, $direction, $size, $assetName, $reasons, $price, $margin, $date)';
  
    const data = {
        $ExchangeAccountID: req.body.ExchangeAccountId,
        $TradeSystemID:     req.body.TradeSystemID,
        $pair:              req.body.pair,
        $isActive:          req.body.isActive,
        $direction:         req.body.direction,
        $size:              req.body.size,
        $assetName:         req.body.assetName,
        $reasons:           req.body.reasons,
        $price:             req.body.price,
        $margin:            req.body.margin,
        $date:              req.body.date
    };
  
    db.all(sql, data, (err, results) => {
      if(err) {
        res.send(err);
      } else {
        res.send(results);
      }
    });
  });
  
  /**
   * Get the trade actions, you can only fetch actions that belong to you.
   * Trade actions are recordings of in or out events
   *
   * TODO: perhaps name these should be called "account events" and not 
   * "trade actions" as this is a log of the current accounts actual in/out events
   * 
   * Request: { 
   *   :id: TradeId
   * }
   *
   * Response: { 
   *   ID
   *   tradeID
   *   type
   *   amount
   *   price
   *   isComplete
   *   reason
   *   created
   * }
   *
   * Response Codes: 200, 404
   */
  router.get('/trade/:id/actions', cors(corsOptions), (req, res, next) => {
    db.all('SELECT * FROM TradeActions WHERE TradeID = $tradeId', {$tradeId: req.params.id}, (err, results) => {
  
      if(err) {
        res.send(err);
      } else {
        res.send(results);
      }
    });
  });
  
  /**
   * Delete a trade by it's id, you can only delete a trade that belongs to you
   *
   * Response Codes: 200, 404
   */
  router.get('/trade/:id/delete', cors(corsOptions), (req, res, next) => {
    db.all('DELETE FROM Trades WHERE Trades.ID = $tradeId', { $tradeId : req.params.id}, (err, results) => {
  
      if(err) {
        res.send(err);
      } else {
        res.send(results);
      }
    });
  
  });
  
  /**
   * Update a trade by marking it as complete
   *
   * TODO: this should also execute any outstanding action logic too, like to sell what remains
   *
   * Request: {
   *   :id: TradeId
   * }
   *
   * Response Codes: 200, 404
   */
  router.get('/trade/:id/complete', cors(corsOptions), (req, res, next) => {
    db.all('UPDATE Trades SET isActive = 0 WHERE Trades.ID = $tradeId', { $tradeId : req.params.id}, (err, results) => {
  
      if(err) {
        res.send(err);
      } else {
        res.send(results);
      }
    });
  
  });
  
  /**
   * Get the exposure of the exchange account
   *
   * @TODO use a query, also need input variables such as accountID and start/end date
   *
   * Response: {
   *   value: 10
   * }
   *
   * Response Codes: 200, 404
   */
  router.get('/trade/exposure', cors(corsOptions), (req, res, next) => {
    res.send(10);
  });
  
  /**
   * Get the profit and loss of the exchange account
   *
   * @TODO use a query, also need input variables such as accountID and start/end date
   *
   * Response: {
   *   value: 20
   * }
   *
   * Response Codes: 200, 404
   */
  router.get('/trade/pnl', cors(corsOptions), (req, res, next) => {
    res.send(20);
  });
  
  /**
   * Get the win loss ratio of the exchange account
   *
   * @TODO use a query, also need input variables such as accountID and start/end date
   *
   * Response: {
   *   value: 60
   * }
   *
   * Response Codes: 200, 404
   */
  router.get('/trade/winratio', cors(corsOptions), (req, res, next) => {
    res.send(60);
  });

  
module.exports = router;