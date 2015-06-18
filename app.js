/*var _ = require('lodash');

var askedForHistory = false;
var askedForHistoryTime = 0;
var N = require("./lib/node.js");

var Primus = require('primus'),
	//api,
	client;

//var WS_SECRET = process.env.WS_SECRET || "eth-net-stats-has-a-secret";

var Collection = require('./models/collection');
var Nodes = new Collection();

var env = 'production';

if( process.env.NODE_ENV !== 'production' )
{
	var express = require('express');
	var app = express();
	var path = require('path');
	var bodyParser = require('body-parser');

	//view engine setup
	app.set('views', path.join(__dirname, 'src/views'));
	app.set('view engine', 'jade');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname, 'dist')));

	app.get('/', function(req, res) {
	  res.render('index');
	});

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handlers
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});

	// production error handler
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});

	var server = ('http://localhost:3000');

	var server = require('http').createServer(app);
}
else
{
	var server = require('http').createServer();
}
/*
spark = new Primus(server, {
	transformer: 'websockets',
	pathname: '/api',
	parser: 'JSON'
});

spark.use('emit', require('primus-emit'));
spark.use('spark-latency', require('primus-spark-latency'));

var client = new Primus(server, {
	transformer: 'websockets',
	pathname: '/primus',
	parser: 'JSON'
});

var clientLatency = 0;

client.use('emit', require('primus-emit'));
console.log(N.WSC3);
if(N.WSC3 == true){
	console.log('Latency: ', N._latency);
	console.log(N.id);
	console.log(N.address);
	console.log(N.query);


		console.log('Latency: ', N.latency);
		console.log('Got hello data from ', N.id);
		console.log(N.stats);
}
/*	if( _.isUndefined(data.secret) || data.secret !== WS_SECRET )
		{
			spark.end(undefined, { reconnect: false });

			return false;
		}
		if(N.startWeb3Connection === true)
		{
			start();
		}
	 	function start()
  {
				//add
		var info = Nodes.add( N );
		client.write({
			action: 'add',
			data: info
		});
		client.write({
			action: 'charts',
			data: Nodes.getCharts()
		});
	//update
		var stats = Nodes.update(N.id, N.stats);
		client.write({
			action: 'update',
			data: stats
		});
		client.write({
			action: 'charts',
			data: Nodes.getCharts()
		});
		//history

		console.log("got history from " + N.id);

		client.write({
			action: 'charts',
			data: Nodes.addHistory(N.id, N.history)
		});

		askedForHistory = false;
		var range = Nodes.getHistory().getHistoryRequestRange();

		console.log("asked " + N.id + " for history: " + range.min + " - " + range.max);
		spark.emit('history', range);
		askedForHistory = true;
		askedForHistoryTime = _.now();
//latency
		var stats = Nodes.updateLatency(N.id, N.latency);

		client.write({
		action: 'latency',
		data: stats
	});
}/*
		if( !_.isUndefined(N.id) && !_.isUndefined(N.info) )
		{
			data.ip = N.address.ip;
			data.N = N.id;
			data.latency = N.latency;

			var info = Nodes.add( data );
			spark.emit('ready');

		-	client.write({
				action: 'add',
				data: info
			});

		-	client.write({
				action: 'charts',
				data: Nodes.getCharts()
			});
			console.log(data.id);
		}

	spark.on('update', function(data)
	{
		if( !_.isUndefined(data.id) && !_.isUndefined(data.stats) )
		{
			data.stats.latency = N.latency;

			var stats = Nodes.update(data.id, data.stats);

			if(stats !== false)
			{
				-client.write({
					action: 'update',
					data: stats
				});

			-	client.write({
					action: 'charts',
					data: Nodes.getCharts()
				});
			}
		}
	});

	spark.on('history', function(data)
	{
		console.log("got history from " + data.id);

		client.write({
			action: 'charts',
			data: Nodes.addHistory(data.id, data.history)
		});

		askedForHistory = false;
	});

	spark.on('node-ping', function(data)
	{
		spark.emit('node-pong');
	});

	spark.on('latency', function(data)
	{
		if( !_.isUndefined(data.id) )
		{
			var stats = Nodes.updateLatency(data.id, data.latency);

			client.write({
				action: 'latency',
				data: stats
			});

			if( Nodes.requiresUpdate(data.id) && (!askedForHistory || _.now() - askedForHistoryTime > 200000) )
			{
				var range = Nodes.getHistory().getHistoryRequestRange();

				console.log("asked " + data.id + " for history: " + range.min + " - " + range.max);

				spark.emit('history', range);

				askedForHistory = true;
				askedForHistoryTime = _.now();
			}
		}
	});

	spark.on('end', function(data)
	{
		var stats = Nodes.inactive(N.id);

		client.write({
			action: 'inactive',
			data: stats
		});
	});
//});

client.on('connection', function(clientSpark)
{
	clientSpark.on('ready', function(data)
	{
		clientSpark.emit('init', { nodes: Nodes.all() });

		clientSpark.write({
			action: 'charts',
			data: Nodes.getCharts()
		});
	});

	clientSpark.on('client-pong', function(data)
	{
		var latency = Math.ceil( (_.now() - clientLatency) / 2 );

		clientSpark.emit('client-latency', { latency: latency });
	});
});

var latencyTimeout = setInterval( function ()
{
	clientLatency = _.now();

	client.write({ action: 'client-ping' });
}, 5000);


// Cleanup old inactive nodes
var nodeCleanupTimeout = setInterval( function ()
{
	client.write({
		action: 'init',
		data: Nodes.all()
	});

	client.write({
		action: 'charts',
		data: Nodes.getCharts()
	});
}, 1000*60*60);

server.listen(process.env.PORT || 3000);

module.exports = server;
*/
//api-part
'use strict';

var nodeModel = require('./lib/node');

var node = new nodeModel();

var gracefulShutdown = function() {
	console.log('');
    console.error("xxx", "sys", "Received kill signal, shutting down gracefully.");

    node.stop();
    console.info("xxx", "sys", "Closed node watcher");

    setTimeout(function(){
        console.info("xxx", "sys", "Closed out remaining connections.");
        process.exit(0);
    }, 5*1000);
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);

// listen for shutdown signal from pm2
process.on('message', function(msg) {
	if (msg == 'shutdown')
		gracefulShutdown();
});

module.exports = node;
