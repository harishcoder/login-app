var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var exhbs = require('express-handlebars');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongo = require('mongodb');
var mongoose = require('mongoose');

var db = mongoose.connection;

//routes

var routes = require('./routes/index');
var users = require('./routes/users');

//init

var app = express();

//setup engine

app.set('views' , path.join(__dirname , 'views'));
app.engine('handlebars',exhbs({defaultLayout:'layout'}));
app.set('view engine','handlebars');

//body parser middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());

//set public folder

app.use(express.static(path.join(__dirname,'public')));

//express-session middleware

app.use(session({
    secret:'secret',
    saveUninitialized : true,
    resave : true
}));

//passport initialize

app.use(passport.initialize());
app.use(passport.session());

//express-validator middleware

app.use(expressValidator({
    errorFormatter:function(param,msg,value){
     var namespace = param.split('.')
     , root = namespace.shift()
     , formParam = root;
        
        while (namespace.length)
            {
                formParam +='[' +namespace.shift() + ']';
            }
         return{
             param : formParam,
             msg : msg,
             value:value
         }
        }
}));

//connect flash

app.use(flash());

//global variable for flash
app.use(function(req,res,next){
   res.locals.success_msg = req.flash('success_msg') ;
   res.locals.error_msg = req.flash('error_msg') ;
   res.locals.error = req.flash('error') ;
   res.locals.user = req.user || null;
   next();
});

//use routes

app.use('/',routes);
app.use('/users',users);

//set port

app.set('port' , (process.env.PORT || 3000));

app.listen(app.get('port'),function(){
    console.log('server is running at ' + app.get('port'));
})


