"use strict";

const config = require("./config.json");

const koa = require("koa.io");
const hbs = require("koa-hbs");
const serve = require("koa-static-folder");

const Q = require("q");

// for passport support
const session = require("koa-generic-session");
const bodyParser = require("koa-bodyparser");
const passport = require("koa-passport");



const app = koa();
// var io = require('socket.io')(app);

exports.app = app;
exports.passport = passport;

// the auth model for passport support
require("./models/auth");

// misc handlebars helpers
require("./helpers/handlebars");

// trust proxy
app.proxy = true;

// sessions
app.keys = [config.site.secret];
app.use(session({cookie: {maxAge: 8 * 60 * 60 * 1000}}));

// body parser
app.use(bodyParser());

// authentication
app.use(passport.initialize());
app.use(passport.session());

// statically serve assets
app.use(serve("./assets"));

// load up the handlebars middlewear
app.use(hbs.middleware({
	viewPath: `${__dirname}/views`,
	layoutsPath: `${__dirname}/views/layouts`,
	partialsPath: `${__dirname}/views/partials`,
	defaultLayout: "main"
}));

app.use(function* error(next) {
	try {
		yield next;
	} catch (err) {
		this.status = err.status || 500;
		this.body = err.message;
		this.app.emit("error", err, this);
	}
});

require("./routes");

app.io.use(function* (next) {
  // on connect
  yield* next;
  // on disconnect
});

var votes = {};

app.io.route('submit-vote', function* (next, data){
  if (votes[data.voter] != data.vote) {
    votes[data.voter] = data.vote;
    this.broadcast.emit('vote-recieved', data);
  }
});

app.io.route('start-vote', function* (next, data){
  votes = {};
  this.broadcast.emit('start-vote', data);
});

app.io.route('stop-vote', function* (next, data){
  this.broadcast.emit('stop-vote', data);
});

var db = require("./db.js");
var sync = Q.nfbind(db.sync({}));
sync();

app.listen(config.site.port);
console.log(`${config.site.name} is now listening on port ${config.site.port}`);

process.on("SIGINT", function exit() {
	process.exit();
});
