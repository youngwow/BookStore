if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', error => console.log(error));
db.once('open', () => console.log('Connected to Mongoose.'));


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

const app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}));
app.use(methodOverride('_method'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.listen(process.env.PORT || 3000);

module.exports = app;
