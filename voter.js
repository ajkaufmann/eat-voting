const config = require("./config.json");
const koa = require("koa.io");
const hbs = require("koa-hbs");
const serve = require("koa-static-folder");

// for passport support
const session = require("koa-generic-session");
const bodyParser = require("koa-bodyparser");
const passport = require("koa-passport");

// var io = require('socket.io')(app);
var db = require("./db");

Voter = (function() {
  Voter.prototype.port = null;

  Voter.prototype.app = null;

  function Voter(opts) {
    console.log("NEW VOTER");
    this.port = 5000;
    return;
  }

  Voter.prototype.start = function*() {
    console.log("A");
    // the auth model for passport support
    require("./models/auth");

    // misc handlebars helpers
    require("./helpers/handlebars");
  
    this.app = koa();
    // yield db.sync();
    // trust proxy
    this.app.proxy = true;

    // sessions
    this.app.keys = [config.site.secret];
    this.app.use(session());

    // body parser
    this.app.use(bodyParser());

    // authentication
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // statically serve assets
    this.app.use(serve("./assets"));

    // load up the handlebars middlewear
    this.app.use(hbs.middleware({
    	viewPath: `${__dirname}/views`,
    	layoutsPath: `${__dirname}/views/layouts`,
    	partialsPath: `${__dirname}/views/partials`,
    	defaultLayout: "main"
    }));

    this.app.use(function* error(next) {
    	try {
    		yield next;
    	} catch (err) {
    		this.status = err.status || 500;
    		this.body = err.message;
    		this.this.app.emit("error", err, this);
    	}
    });

    require("./routes");

    this.app.io.use(function* (next) {
      // on connect
      // console.log("THIS IS INSIDE THE USE FUNCTION!");
      // this.broadcast.emit('hihi', {message: "PLZ!"});
      // console.log(this.broadcast.emit('hihi', {message: 'yo'}));
      yield* next;
      // console.log("POST NEXT");
      // on disconnect
    });

    var votes = {};

    this.app.io.route('new message', function* (next, message) {
      // we tell the client to execute 'new message'
      console.log("SERVER SIDE NEW MESSAGE");
      var message = "WE WORKING?";
      this.emit('hihi', {message: message});
    });

    this.app.io.route('vote-add', function* (next, message){
      console.log("SERVER SIDE ADDING A VOTE.");
      this.emit('v1', {message: "I'd like to see how this works."});
    });
    console.log("B");

    this.app.io.route('submit-vote', function* (next, data){
      // console.log("SERVER SIDE SUBMITTING A VOTE.");
      console.log(votes);
      // console.log(data);
      if (votes[data.voter] != data.vote) {
        votes[data.voter] = data.vote;
        this.broadcast.emit('vote-recieved', data);
      }
    });

    this.app.io.route('start-vote', function* (next, data){
      console.log("UPDATE NAME SERVER SIDE. NAME: " + data.name);
      votes = {};
      this.broadcast.emit('start-vote', data);
    });
    this.app.io.route('stop-vote', function* (next, data){
      this.broadcast.emit('stop-vote', data);
    });
    console.log("C");
    this.app.listen(this.port);
    console.log("D");
    console.log(`${config.site.name} is now listening on port ${config.site.port}`);
    // console.log(io);
    // io.sockets.on('connection', function (socket) {
    //   socket.emit('news', { hello: 'world' });
    //   socket.on('my other event', function (data) {
    //     console.log(data);
    //   });
    // });

    process.on("SIGINT", function exit() {
    	process.exit();
    });
  };

  return Voter;

})();

module.exports = Voter;

// ---
