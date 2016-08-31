var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Spending Approval' });
});

router.get('/selfassessment', function (req,res,next) {
  res.render('selfassessment', {title: 'Spending Approval', selfassessment: req.app.locals.SELFASSESSMENT});
});

router.get('/table', function(req,res,next) {
  res.render('table', {title: 'Table rendering experiment'});
})

module.exports = router;
