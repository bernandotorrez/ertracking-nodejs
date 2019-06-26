var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('express-flash');
var helmet = require('helmet')
var indexRouter = require('./routes/index');
var soapRouter = require('./routes/soap');
var homeRouter = require('./routes/home');
var adminRouter = require('./routes/admin');
var winston = require('winston');

var app = express();

app.use(cookieParser());

var MemoryStore = session.MemoryStore;
app.use(session({
    secret: "B3rnando'",
    resave: true,
    store: new MemoryStore(),
    maxAge: 3600,
    saveUninitialized: true,
    //cookie: { secure: true, maxAge: 3600 }
}));

app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// wajib saat naik ke production
if(process.env.NODE_ENV=='production'){
  app.use(helmet());
}
// wajib saat naik ke production
//app.disable('x-powered-by');

app.use('/', indexRouter);
app.use('/soap', soapRouter);
app.use('/home', homeRouter);
app.use('/admin', adminRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  winston.error(err.message, err);
  winston.configure({transports: [new winston.transports.File({ filename: 'logfile.log' }) ]});

  res.locals.message = err.message;
  res.locals.error = req.app.get('env').trim() == 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//console.log(process.env.NODE_ENV);

module.exports = app;
