var express = require('express');
var app = express();
const pools = require('../../SampleJSONS/poolsReturn.json')
const history = require('../../SampleJSONS/historyReturn.json')
const addressList = require('../../SampleJSONS/accountsReturn.json')

app.use(express.json()); //Use to read json of incoming request

//Allows CORS stuff
app.use(function (req, res, next) {
    //set headers to allow cross origin requestt
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//When GET /pools is made
app.get('/pools', function (req, res) {
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(pools)); //Pools will be a created object, not a json file
});

app.get('/accounts', function (req, res) {
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(addressList)); //Pools will be a created object, not a json file
});

//When POST /history is made, request will come with a JSON (so must use POST)
app.post('/history', function (req, res) {
    console.log(req.body); //Read request body
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(history));
});

app.post('/startTask', function (req, res) {
    console.log(req.body); //Read request body
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify({"Success": 1}));
});
app.post('/updateTask', function (req, res) {
    console.log(req.body); //Read request body
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify({"Success": 1}));
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Example app listening at port %s', port);
});
module.exports = server;

