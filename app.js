var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var expressHandlebars = require('express-handlebars')
var hbs = require('handlebars')
var expressValidator = require('express-validator')
var flash = require('connect-flash')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var mongo = require('mongodb')
var mongoose = require('mongoose')
onlineUsers = []
rooms = []
mongoose.connect('mongodb://armana:armana1@ds039427.mlab.com:39427/tictactoe')

var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
app.use(function(req, res, next) {
	req.io = io
	next()
})

var index = require('./routes/index')
var users = require('./routes/users')

app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }))
app.set('view engine', 'handlebars')

hbs.registerHelper('ifCond', function(v1, v2, options) {
	if (v1 === v2) {
		return options.fn(this)
	}
	return options.inverse(this)
})

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

var session = require('express-session')({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
})
var sharedsession = require('express-socket.io-session')

app.use(session)
io.use(
	sharedsession(session, {
		autoSave: true
	})
)

var gnsp = io.of('/game')
gnsp.use(
	sharedsession(session, {
		autoSave: true
	})
)

var funcions = require('./models/functions')
var socketio = require('./modules/socket_io')(io)
var socketiogame = require('./modules/socket_io_game')(io, gnsp)

app.use(passport.initialize())
app.use(passport.session())

app.use(
	expressValidator({
		errorFormatter: function(param, msg, value) {
			var namespace = param.split('.'),
				root = namespace.shift(),
				formParam = root

			while (namespace.length) {
				formParam += '[' + namespace.shift() + ']'
			}
			return {
				param: formParam,
				msg: msg,
				value: value
			}
		}
	})
)

app.use(flash())

app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.validation = req.flash('validation')
	res.locals.error = req.flash('error') //This is because passport generates its own error messae
	res.locals.user = req.user || null
	next()
})

app.use('/', index)
app.use('/users', users)

app.use(function(req, res, next) {
	var err = new Error('Not Found')
	err.status = 404
	next(err)
})

app.use(function(err, req, res, next) {
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	res.status(err.status || 500)
	res.render('error')
})

app.set('port', process.env.PORT || 3000)

http.listen(app.get('port'), function() {
	console.log('Server started on port ' + app.get('port'))
})

module.exports = app
