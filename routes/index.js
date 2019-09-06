var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, ensureLoggedIn, function(req, res){
	res.render('index');
});
router.get('/game',ensureAuthenticated, ensureInvited, function(req, res){
	res.render('game', {game: true});
});

function ensureAuthenticated(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}else{
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}
function ensureLoggedIn(req, res, next){
	if (req.user) {
		return next();
	}else{
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}
function ensureInvited(req, res, next){
	var user = getOnlineUserByUserId(req.user._id);
	if (user.status === true && user.gameSockets.length === 0) {
		return next();
	}else{
		if (user.gameSockets.length<0) {
			req.flash('error_msg', 'You have to invite someone in order to play.');
		}
		res.redirect('/');
	}
}

module.exports = router;