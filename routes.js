var appRouter = function(app) {

    var accountsRouter = require('./routes/accounts');
    app.use('/accounts', accountsRouter);

    var tradesRouter = require('./routes/trades');
    app.use('/trades', tradesRouter);

}

module.exports = appRouter;