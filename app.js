const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const session = require('express-session');
require('dotenv').config();

//For Timestamp messages in console
require('console-stamp')(console, 'HH:MM:ss');

//Initialize statements
const app = express();
let Task = require('./models/task');
let env = process.env;
let db = mongoose.connection;

//Set Public folder path
app.use(express.static(path.join(__dirname, 'public')));

//Database related
  //DB Connection
  mongoose.connect(env.db_string);

  //Check DB connection
  db.once('open', function(err){
    console.log('Connection made to Database: '+env.db_name);
  })

  //Check for DB errors
  db.on('error', function(err){
    console.log(err);
  })

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

//Middleware
  //Body Parser Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  //Express Session Middleware
  app.use(session({
      secret: 'keyboard cat',
      resave: true,
      saveUninitialized: true,
      // cookie: {secure: true}
  }));

  //Express Messages Middleware
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
      res.locals.messages = require('express-messages')(req, res);
      next();
  });

  // Express Validator Middleware
  app.use(expressValidator({
      errorFormatter: function(param, msg, value) {
          var namespace = param.split('.')
          , root = namespace.shift()
          , formParam = root;
          while(namespace.length) {
              formParam += '[' + namespace.shift() + ']';
          }
          return {
              param : formParam,
              msg   : msg,
              value : value
          };
      }
  }));

//Routes
  //DOM: Show 'Home' Page
  app.get('/', function(req,res){
    res.render('page_home', {
      title: 'This is the app home page!'
    });
  });

  //Task Routes File
  let tasks = require('./routes/routes_tasks');
  app.use('/tasks', tasks);

//Start App Server
app.listen((process.env.PORT || 3000), function(){
  console.log('Server started on port 3000 (localhost) or '+process.env.PORT+' (heroku).');
});
