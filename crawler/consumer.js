var request = require("request");
var assert = require('assert');
var cheerio = require("cheerio");
var MongoClient = require('mongodb').MongoClient;
var fivebeans = require("fivebeans");
var mongourl = 'mongodb://admin:admin@ds059692.mongolab.com:59692/aftership'; // Connection URL
var success_times = 0;
var error_times = 0;
var tubes = ["wen777"];



var getPCurrency = function(payload, callback) {
    // request({
    //         url: "http://www.xe.com/zh-HK/currencyconverter/convert/?Amount=1&From=" + payload["from"] + "&To=" + payload["to"] + "#rates",
    //         method: "GET"
    //     }, parse);
    //

    request({
        url: "http://www.xe.com/zh-HK/currencyconverter/convert/?Amount=1&From=" + payload["from"] + "&To=" + payload["to"] + "#rates",
        method: "GET"
    }, function(err, response, body) {

        if (!err && body) {
            $ = cheerio.load(body);
            var currencyData = $("td.leftCol");
            var result = currencyData.text().split(/\s/);
            // Check data is existed
            if (result.length > 0 && !(result[0] === undefined) && parseFloat(result[0]) > 0 && result[1] !== "---" && parseFloat(result[5]) > 0) {
                dataParse = {
                        "from": result[1],
                        "to": result[6],
                        "created_at": new Date(),
                        "rate": (Math.round(parseFloat(result[5]) / parseFloat(result[0]) * 100) / 100).toString()
                    }
                    // Insert data to Mongo
                    // writeDB(dataParse);
                MongoClient.connect(mongourl, {
                    native_parser: true
                }, function(err, db) {
                    if (!err && dataParse) {
                        // insertDocuments(db, dataParse);
                        var collection = db.collection('currency');
                        // Insert some documents
                        if (typeof dataParse === "object") {
                            collection.insert(dataParse, function(err, result) {
                                assert.equal(err, null);
                                db.close();
                                // if (!err) {
                                //     requirement();
                                // } else {
                                //     requirement(1000, "mongo insert error");
                                // }
                                callback();
                            });
                        } else {
                            db.close();
                            console.log("[function][insertDocuments] error, data isn't object type");
                        }

                        //
                    } else {
                        db.close();
                        console.log("[function][writeDB] error," + err);
                    }
                });
            }
        } else {
            callback(500, "Network error");
            console.log("500, Network error");
            // requirement(500, "Network");
        }
    })
}

function conWorker() {
    var client = new fivebeans.client('challenge.aftership.net', 11300);
    client.on('connect', function() {
        // Get curerent job id
        client.watch(tubes, function(err, numwatched) {
            console.log("client id, " + numwatched);
            // if (tubes && tubes.length){
            //     client.ignore(['default'],function(tube, numwatched){
            //         client.emit('started');
            //         client.emit('next');
            //     });
            client.reserve(function(err, jobid, payload) {
                console.log("reserve job, jobid is " + jobid);
                var data = JSON.parse(payload.toString());

                // parse data and insert data to mongodb
                getPCurrency(data[1]["payload"], function(err, res) {

                    if (!err && success_times < 10) {
                        success_times++;
                        client.use(tubes, function(err, tubename) {
                            client.put(0, 0, 60, JSON.stringify(data), function(err, jobid) {
                                if (!err) {
                                    console.log("success_times " + success_times + ", reput job, id = " + jobid);
                                    client.end();
                                } else {
                                    console.log("error, reput job." + err);
                                }
                            });
                        });
                        setTimeout(function() {
                            conWorker();
                        }, 1000 * 60)
                    } else if (err && error_times < 3 ) {
                        error_times++;
                        setTimeout(function() {
                            //reput the job to queue
                            client.put(0, 0, 60, JSON.stringify(data), function(err, jobid) {
                                client.end();
                                conWorker();
                            });
                        }, 1000 * 3)
                    } else {
                        process.exit(0);
                    }
                });

                // Delete job
                client.destroy(jobid, function(err) {
                    if (err) {
                        console.log("Delete job " + jobid + ", error is" + err);
                    } else {
                        console.log("Delete job " + jobid);
                    }
                });
            });
        });
    }).connect();
}

conWorker();
