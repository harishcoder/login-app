var express =require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/model');


router.get('/register',(req,res)=>{
    res.render('register');
});

router.get('/login',(req,res)=>{
    res.render('login');
});

//register user

router.post('/register',(req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username; 
    var password = req.body.password;   
    var password1 = req.body.password1;
    
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password1', 'password donot match').equals(req.body.password);
    
    //check validation
    
    var errors = req.validationErrors();
    if(errors){
        res.render('register',{
            errors:errors,
            name:name,
            email:email,
            username:username,
            password:password
        });
    }
    else{
        var newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
            });
        
        //create user
        User.createUser(newUser, function(err,user){
        if(err) throw err;
        console.log(user);
    });
        req.flash('success_msg' , 'you are registered you may log in!');
        
        res.redirect('/users/login');
    }
});

//passport serializer
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});



//passport local strategy that check the validation of input
passport.use(new LocalStrategy(
function(username , password , done){
  User.getUserByUsername(username,function(err,user){
      if(err) throw err;
      if(!user){
          console.log('unknown user');
          return done(null,false,{message:'unknown user'});
      }
      User.comparePassword(password,user.password,function(err,isMatch){
          if(err) throw err;
          if(isMatch)
              {
                  return done(null,user);
              }
          else{
            console.log('invalid password');
          return done(null,false,{message:'Invalid password'});
          }
          
      })
      
  }) 
    

}));



// passport authentication

router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Email id and password is invalid' }),function(req,res){
   console.log('Authentication is successfull');
    req.flash('success_msg','You are logged in');
    res.redirect('/');
    
});

router.get('/logout',function(req,res){
    req.logout();
    console.log('reached');
    req.flash('success_msg','you have logged out');
    res.redirect('/users/login');
    
}); 

module.exports = router;
    