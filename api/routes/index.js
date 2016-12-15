var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var http = require('http');
var fs = require('fs');
var findRemoveSync = require('find-remove');
var app = express();
require('dotenv').config();

var imageNames = [];

function removeImages(imageNames) {
  return new Promise((resolve, reject) => {
    imageNames = [];
    resolve();
  });
}

function addImages(collection) {
  return new Promise(function(resolve, reject) {
    for(map in collection) {
      console.log(`image title: ${collection[map]}`);
      resolve(imageNames.push(collection[map]));
    }
  });
}

router.post('/get-maps', (req, res, next) => {

  removeImages(imageNames).then(function(data){
    addImages(req.body);
  });

  var baseUrl = 'http://beta.mapquestapi.com';
  var API = 'staticmap/v5';
  var endpoint = 'getmap';
  var key = process.env.MQ_API_KEY;
  var dimensions = 'size=600,600@2x';

  function getStaticMap(currentMap) {
    return new Promise(function(resolve, reject) {
      var mapRequest = `${baseUrl}/${API}/${endpoint}?key=${key}&${dimensions}&locations=${currentMap}&defaultmarker=none&type=hyb`;
      http.get(mapRequest, function(res) { // hit static map
        console.log(`making request to static maps for ${currentMap}`);
        var imagedata = '';
        res.setEncoding('binary');
        res.on('data', (chunk) => { imagedata += chunk });
        res.on('end', () => {
          fs.writeFile(`../client/assets/${currentMap}.png`, imagedata, 'binary', (res, err) => { // save it to the directory in client /assets
            if (err) throw err
            console.log('File saved.');
            setTimeout(resolve(), 5000);
          });
        });
      });
    });
  }

  (() => {
    imageNames = [];
    return new Promise((resolve, reject) => {
      for(map in req.body) {
        (function(map) {
          setTimeout(function() {
            resolve(getStaticMap(map))
          }, 3000);
        })(req.body[map]);
      }
    });
  })().then(function(data){
    res.redirect('http://localhost:1234')
  });
});

router.get('/image-titles', (req, res, next) => {
  res.json({'titles' : imageNames})
});

router.get('/test', function(req, res, next) {
  res.json({
    'health' : 'healthy'
  });
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
