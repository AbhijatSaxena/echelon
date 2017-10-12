//Requires
var express = require('express');
var mongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var _ = require('lodash');

function generateGUID() {
    var result, i, j;
    result = '';
    for (j = 0; j < 32; j++) {
        if (j === 8 || j === 12 || j === 16 || j === 20) {
            result = result + '-';
        }
        i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
        result = result + i;
    }
    return result;
}

//App
var app = express();
app.use(bodyParser.json());

//DB
var db;
mongoClient.connect('mongodb://admin:admin@ds127783.mlab.com:27783/echelondb', function (err, database) {
    if (err) return console.log(err);
    db = database;
    app.listen(process.env.PORT, function () {
        console.log('[ http://localhost:' + process.env.PORT + ' LIVE ]');
    });
});

//API
app.get('/', function (req, res) {
    res.send('Echelon Server');
});

//GET Collections
app.get('/system.collection', function (req, res) {
    db.listCollections().toArray(function (err, allCollections) {
        var collections = _.filter(allCollections, function (item) {
            return item.name !== 'system.indexes' &&
                item.name !== 'objectlabs-system' &&
                item.name !== 'objectlabs-system.admin.collections';
        });
        res.send(collections);
    });
});
//Rename Collection
app.put('/system.collection/rename', function (req, res) {
    var requestObj = req.body;
    db.collection(requestObj.from).rename(requestObj.to, function (err, newCollection) {
        if (!err) {
            res.send('Successfully Renamed');
        } else {
            res.send('Error in Renaming');
        }
    });
});
app.delete('/system.collection/:collectionName', function (req, res) {
    db.collection(req.params.collectionName).drop(function (err) {
        if (!err) {
            res.send(req.params.collectionName + ' Successfully Dropped');
        } else {
            res.send('Error in Dropping');
        }
    });
});

//GET Specific Collection
app.get('/:cname', function (req, res) {
    db.collection(req.params.cname).find().toArray(function (err, results) {
        res.send(results);
    });
});
//GET Specific Document of a Specific Collection
app.get('/:cname/:docId', function (req, res) {
    db.collection(req.params.cname).find({id: req.params.docId}).toArray(function (err, results) {
        res.send(results);
    });
});

//POST a new Document in the Collection
app.post('/:cname', function (req, res) {
    var requestObj = req.body;
    requestObj.id = generateGUID();
    db.collection(req.params.cname).save(requestObj, function (err) {
        if (err) return res.send('Error');
        return res.send('Created');
    });
});

//DELETE a specific Document in a Collection
app.delete('/:cname/:docId', function (req, res) {
    db.collection(req.params.cname).remove({id: req.params.docId}, function (err) {
        if (err) return res.send('Error');
        return res.send('Deleted');
    });
});