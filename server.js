const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const swig = require('swig');
const cors = require('cors');
const Docker = require('dockerode');
const expressSession = require('express-session');
const expressValidator = require('express-validator');

swig.setDefaults({ cache: false });

const sqlite = require('sqlite3');
const db = new sqlite.Database('./database.sqlite');
db.run("PRAGMA foreign_keys = ON");

const session = {
  secret: 'change me',
  resave: false,
  saveUninitialized: true
};

const app = express();

// what is extended for??
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(expressSession(session));

app.set('view engine', 'html');
app.engine('html', swig.renderFile);

// if your here to add json support, just dont bother, use queryString.stringify instead on the app
// TODO check security implications here, apparently this can be bad
var corsOptions = {
  origin: 'https://api.be180.co.uk:3003',
  optionsSuccessStatus: 200
};

app.use('/accounts',   require('./routes/accounts'))
app.use('/users',      require('./routes/user'))
app.use('/trades',     require('./routes/trades'))
app.use('/strategies', require('./routes/strategies'))

//const port = process.env.PORT || 443;
//app.listen(port, () => console.log(`listening on port ${port}`));
module.exports.handler = serverless(app);
