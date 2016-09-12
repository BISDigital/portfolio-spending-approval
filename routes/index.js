var express = require('express');
var router = express.Router();
var airtableData = require('../airtabledata');

var busboy = require('connect-busboy');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Spending Approval' });
});

router.get('/selfassessment', function (req,res,next) {
  res.render('selfassessment', {title: 'Spending Approval self-assessment', selfassessment: req.app.locals.SELFASSESSMENT});
});

router.get('/table', function(req,res,next) {
  res.render('table', {title: 'Table rendering experiment'});
})



/* Posts */
router.post("/submitapplication", function(req,res,next) {
  console.log("Files:")
  console.log(req.body);
  airtableData.createRecordFromPost(req.body, function(record) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      location: '/selfassessment?proj='+record.fields['Application ID']
    }));
  });
})

router.post('/file', function(req,res,next) {  
  console.log("marco...")
  req.pipe(req.busboy);
  console.log("polo...")
  req.busboy.on('file', function (fieldname, file, filename) {
      console.log("Uploading: " + filename); 

      // create guid - see http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
      var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });

      var directory = __dirname + '/../public/uploads/' + guid;

      fs.mkdirSync(directory)
      var fstream = fs.createWriteStream(directory + '/' + filename);
      file.pipe(fstream);
      fstream.on('close', function () {
          console.log("Done uploading " + filename)            
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({
            location: '/uploads/'+guid+'/' + filename,
            name: fieldname
          }));
          setTimeout(function() {
            fs.unlinkSync(directory + '/' + filename); 
            fs.rmdirSync(directory);
          }, 60*60*1000);
      });
      
  });
});



module.exports = router;
