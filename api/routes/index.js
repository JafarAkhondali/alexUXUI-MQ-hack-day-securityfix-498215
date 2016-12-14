var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var http = require('http')
var fs = require('fs')
var app = express();

var baseUrl = 'http://www.mapquestapi.com';
var API = 'staticmap/v4';
var endpoint = 'getplacemap';
var key = 'key='; // put key here
var dimensions = 'size=600,600';

var map = `${baseUrl}/${API}/${endpoint}?${key}&${dimensions}&zoom=13&location=los+angeles`;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/static-map', (req, res, next) => {
  var Request = unirest.get(map).end((response) => {
    console.log('the map: ', response);
  })
  res.json({response: response})
})

router.get('/save', function(req, res, next) {
  http.get(map, (res) => {
    var imagedata = ''
    res.setEncoding('binary')
    res.on('data', function(chunk){
      imagedata += chunk
    })
    res.on('end', () => {
      fs.writeFile('../assets/mq.png', imagedata, 'binary', (res, err) => {
        if (err) throw err
        console.log('File saved.')
      })
    })
  })
  res.send('got that image')
})

router.get('/logs',function(req,res){
  var path = './images'
  var imageContainer = [];

  // read dir
  function readDirectory(callback){
    fs.readdir(path, function(err, items) {
      imageContainer.push(items);
      callback(imageContainer);
    });
  }
  // push dir to client
  readDirectory(function(logFiles){
    res.json({files : logFiles});
  });
});

router.get('/test', function(req, res, next) {
  res.send('healthy')
})

module.exports = router;
