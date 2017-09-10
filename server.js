const Sockhop=require("sockhop");
const webserver=require("http").createServer();
const express=require('express');
const app = express();
const morgan=require('morgan');
const log = require("bunyan").createLogger({"name":"jungle"});
const stream=require('stream');
const body_parser = require("body-parser");
const WebsocketServer=require("ws").Server;
const nconf = require('nconf');


log.level("debug");

// Read the config
nconf.argv().file({ file: 'config.json' });


// A stream to pipe morgan (http logging) to bunyan
(info_log_stream=new stream.Writable())
._write=(chunk, encoding, done) => {

    log.info(chunk.toString().replace(/^[\r\n]+|[\r\n]+$/g,""));
    done();
};

// // Start up the server
// var socket_server=new Sockhop.server(nconf.get("jungle_server"));

// Websockets server
var wss=new WebsocketServer({server: webserver});


// Set up webservice
webserver.on("request", app);
app
    .use(body_parser.urlencoded({extended: false}))     // Middleware for POST body parsing (use x-www-form-urlencoded). We would like to use this on a per-router basis, but it inhibits our ability to check body auth (below)
	.use(morgan(':remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', { "stream" : info_log_stream }))   // Morgan HTTP logging
	.use(express.static("public"));
	
// Start web service
webserver.listen(nconf.get("webservice").port, nconf.get("webservice").address, function() {

	log.info("webservice listening on %s:%s", nconf.get("webservice").address, nconf.get("webservice").port);
});




