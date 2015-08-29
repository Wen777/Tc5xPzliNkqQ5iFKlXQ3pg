var fivebeans = require('fivebeans');
//var host = 'localhost';
var host = 'challenge.aftership.net';
var port = 11300;
var tube = 'wen777';

// Define 10 task
var taskList = [
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  // {type: 'rate', payload:{"from": "HKD", "to": "USD" }},
  {type: 'rate', payload:{"from": "HKD", "to": "USD" }}
];

var doneEmittingJobs = function(){
		console.log('We reached our completion callback. Now closing down.');
		emitter.end();
		process.exit(0);
	};

var continuer = function(err, jobid){
		if (taskList.length === 0)
				return doneEmittingJobs();
		console.log('emitted job id: ' + jobid);
		emitter.put(0, 0, 60, JSON.stringify([tube, taskList.shift()]), continuer);
	};

var emitter = new fivebeans.client(host, port);
emitter.on('connect', function(){
	emitter.use(tube, function(err, tname){
		console.log("using " + tname);
		emitter.put(0, 0, 60, JSON.stringify([tube, taskList.shift()]), continuer);
	});
});

emitter.connect()

// emitter
// 		.on('connect', function()
// 		{
// 				// client can now be used
// 				emitter.use(tube, function(err, tname){
// 					emitter.put(0, 0, 60, JSON.stringify([tube, taskList.shift()]), continuer);
// 				});
// 		})
// 		.on('error', function(err)
// 		{
// 				// connection failure
// 		})
// 		.on('close', function()
// 		{
// 				// underlying connection has closed
// 		})
// 		.connect();
