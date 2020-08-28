const express = require('express');
const bodyParser = require('body-parser');
const swig = require('swig');
const cors = require('cors');

swig.setDefaults({ cache: false });

const sqlite = require('sqlite3');
const db = new sqlite.Database('./database.sqlite');
db.run("PRAGMA foreign_keys = ON");

const app = express();

// what is extended for??
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.set('view engine', 'html');
app.engine('html', swig.renderFile);


app.get('/', (req, res, next) => res.render('index'));

app.post('/', (req, res, next) => {
  const sql = req.body.sql;
  db.all(sql, (err, results) => {
    res.render('index', { sql, results: results, error: err });
  });
});

// if your here to add json support, just dont bother, use queryString.stringify instead on the app
// TODO check security implications here, apparently this can be bad
var corsOptions = {
  origin: 'http://192.168.1.179:3003',
  optionsSuccessStatus: 200
};

app.get('/trades', cors(corsOptions), (req, res, next) => {

  // this makes me feel ill...
  db.all('SELECT Trades.*, TradeSystems.name as systemName, ExchangeAccounts.name as exchangeAccountName FROM Trades JOIN TradeSystems ON (TradeSystems.ID = Trades.TradeSystemID) JOIN ExchangeAccounts ON (ExchangeAccounts.ID = Trades.ExchangeAccountID)', (err, results) => {

   if(err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });


});


app.get('/activeTrades', cors(corsOptions), (req, res, next) => {

  // this makes me feel ill...
  db.all('SELECT Trades.*, TradeSystems.name as systemName, ExchangeAccounts.name as exchangeAccountName FROM Trades JOIN TradeSystems ON (TradeSystems.ID = Trades.TradeSystemID) JOIN ExchangeAccounts ON (ExchangeAccounts.ID = Trades.ExchangeAccountID) WHERE Trades.isActive = 1', (err, results) => {

   if(err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });

});

app.get('/inactiveTrades', cors(corsOptions), (req, res, next) => {
  // this makes me feel ill...
  db.all('SELECT Trades.*, TradeSystems.name as systemName, ExchangeAccounts.name as exchangeAccountName FROM Trades JOIN TradeSystems ON (TradeSystems.ID = Trades.TradeSystemID) JOIN ExchangeAccounts ON (ExchangeAccounts.ID = Trades.ExchangeAccountID) WHERE Trades.isActive = 0', (err, results) => {

    if(err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });
});

app.post('/trade', cors(corsOptions), (req, res, next) => {

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


app.get('/trade/:id/actions', cors(corsOptions), (req, res, next) => {
  db.all('SELECT * FROM TradeActions WHERE TradeID = $tradeId', {$tradeId: req.params.id}, (err, results) => {

    if(err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });
});

app.get('/trade/:id/delete', cors(corsOptions), (req, res, next) => {
  db.all('DELETE FROM Trades WHERE Trades.ID = $tradeId', { $tradeId : req.params.id}, (err, results) => {

    if(err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });

});

app.get('/trade/:id/complete', cors(corsOptions), (req, res, next) => {
  db.all('UPDATE Trades SET isActive = 0 WHERE Trades.ID = $tradeId', { $tradeId : req.params.id}, (err, results) => {

    if(err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });

});

// @TODO make queries from them, also need input variables so the correct account is calculated and date ranges used
app.get('/trade/exposure', cors(corsOptions), (req, res, next) => {
  res.send(10);
});

app.get('/trade/pnl', cors(corsOptions), (req, res, next) => {
  res.send(20);
});

app.get('/trade/winratio', cors(corsOptions), (req, res, next) => {
  res.send(60);
});


const port = process.env.PORT || 443;
app.listen(port, () => console.log(`listening on port ${port}`));
