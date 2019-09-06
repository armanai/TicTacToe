var express = require('express');
var router = express.Router();
var _ = require('lodash');
var passport = require('passport');
var passportCustom = require('passport-custom');
var LocalStrategy = require('passport-local').Strategy;
var CustomStrategy = passportCustom.Strategy;

var User = require('../models/user');


router.get('/',ensureNotLoggedIn, function(req, res, next) {
	res.render('users', {type:"login"});
});
router.get('/register',ensureNotLoggedIn, function(req, res, next) {
	res.render('users', {type:"signup"});
});
router.get('/login', ensureNotLoggedIn,function(req, res, next) {
	res.render('users', {type:"login"});
});
router.get('/guest',ensureNotLoggedIn, function(req, res, next) {
	res.render('users', {type:"playasguest"});
});

function ensureNotLoggedIn(req, res, next){
	if (req.isAuthenticated()) {
		res.redirect('/');
	}else{
		return next();
	}
}

passport.use(new LocalStrategy({usernameField:'loginNickname', passwordField:'loginPass'},
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user){
			if (err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown user'});
			}
			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if (isMatch) {
					return done(null, user);
				}else{
					return done(null, false,{message: 'Invalid password'});
				}
			});
		});
	}
	));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local',{successRedirect:'/', failureRedirect:'/users/login', failureFlash:true}),
	function(req, res) {
		req.flash('success_msg', 'Welcome '+req.body.loginNickname+'!');
		res.redirect('/');
	});

router.post('/register', 
	function(req, res){
		var fullname = req.body.signupFullName;
		var username = req.body.signupNickname;
		var email = req.body.signupEmail;
		var password = req.body.signupPass;
		var password2 = req.body.signupPass2;

		req.checkBody('signupFullName','Fullname is required').notEmpty();
		req.checkBody('signupFullName','Fullname is not valid').matches(/^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?\s)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/, "i");
		req.checkBody('signupNickname','Username is required').notEmpty();
		req.checkBody('signupEmail','Email is required').notEmpty();
		req.checkBody('signupEmail','Email is not valid').isEmail();
		req.checkBody('signupPass','Password is required').notEmpty();
		req.checkBody('signupPass','Password is not valid. Password should contain at least 10 characters, one number, uppercase letter and lowercase letter.').isLength({ min: 10 }).matches(/\d/).matches(/[A-Z]/).matches(/[a-z]/);
		req.checkBody('signupPass2','Password do not match').equals(req.body.signupPass);

		var errors = req.validationErrors();
		if(errors){
			req.flash('validation', errors);
			res.redirect('/users/register');
		}else{
			var newUser = new User({
				type:"user",
				fullname:fullname,
				email:email,
				username:username,
				password:password,
				wins: 0
			});
			req.login(newUser, function(err) {
				if (err) { return next(err); }
				return res.redirect('/');
			});
			User.createUser(newUser, function(err, user){
				if (err) throw err;
			});
			req.flash('success_msg', 'Welcome ' + username + '!');
		}
	});
router.post('/guest', 
	guestAuthenticationMiddleware, 
	function (req, res) {        
		res.redirect('/');        
	});
function guestAuthenticationMiddleware(req, res, next){

	if(req.user) return next();

	var username = req.body.guestNickname;
	req.checkBody('guestNickname','Username is required').notEmpty();
	User.getUserByUsername(username, function(err, user){
		console.log("HEEEREE");
		console.log(user);
		if (user == null) {
			var errors = req.validationErrors();
			if(errors){
				req.flash('validation', errors);
				res.redirect('/users/guest');
			}else{
				var newUser = new User({
					type:"guest",
					fullname:"",
					email:"",
					username: username,
					password:"",
					wins: 0
				});
				newUser.save();
				req.flash('success_msg', 'Welcome!');
				req.logIn(newUser,next);
			}
		}else{
			req.flash('validation', 'Choose anothe username. This one already exists.');
			res.redirect('/users/guest');
		}
	})
}
router.get('/logout',function(req, res){
	if (!_.isEmpty(req.user)) {
		if (req.user.type === "guest") {
			User.removeUserById(req.user._id, function(err, user){
				if (err) throw err;
			});
		}
		removeOnlineUser(req.user._id);
	}
	req.logout();
	req.flash('success_msg', 'You are logged out.');
	res.redirect('/users');
});

module.exports = router;
