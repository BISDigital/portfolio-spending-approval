var Airtable = require('airtable');
var airtableBase = new Airtable({ apiKey: 'keygr7oCern0VE3fa' }).base('app8VIDmO9GAC6G96');

var map = { 
  'applicant[name]': 'Applicant Name',
  'applicant[email]': 'Applicant Phone',
  'applicant[phone]': 'Applicant Email',
  applicationType: 'Application Type',
  costBand: 'Cost Band',
  
  phase: 'Requested Phase',
  name: 'Requested Project Name',
  existingId: 'Existing Project Id',
  mandates: 'Mandates',
  directorate: 'Directorate',
  'sro[name]': 'SRO Name',
  'sro[email]': 'SRO Email',
  'sro[phone]': 'SRO Phone',
  technology: 'Proposed Technology',
  usecases: 'Usecases',
  usecaseEvidence: 'Evidence for Usecases',
  //businessCaseDocument: 'Business Case Document',

  finance: 'Financial Case',
  purchasetech: 'Proposed Way of Purchase',
  isMajorPortfolio: 'Included in Major Project Portfolio',
  
  url: 'Proposed URL',
  authentication: 'Authentication Requirements',
  assistedOutline: 'Help for Assisted Digital Users',
  govukexempt: 'Wants GovUK Expemption',
  noGovUkReason: "Request for GovUK Exemption",
  //govukexemptionfile: "Evidence for GovUK Exemption",

  deadlines: 'Deadlines'
};

function postDataToAirtableData(body, secret) {
  var res = {}
  for (var i in map) {
    if (!body[i]) continue;
    res[map[i]] = body[i]
  }

  if (body['bcdUploaded']) res['Business Case Document'] = [{url: body['bcdUploaded'] + "/" + secret}];
  if (body['gueUploaded']) res['Evidence for GovUK Exemption'] = [{url: body['gueUploaded'] + "/" + secret}];
  
  return res;
}

function tokeniseReverse(name) {
  var res = [];
  var regex = /([^\]\[]+)/g
  var matches = name.match(regex);
  for (var i = matches.length - 1; i >= 0; i--) {
    res.push(matches[i]);
  }
  return res;
}

function getRecord(id, callback) {
  airtableBase('Applications').find(id, function(err, record) {
    var res = {};
    //todo: error handling
    for (var i in map) {
      var ts = tokeniseReverse(i);
      var o = res;
      while (ts.length > 1) {
        var t = ts.pop();
        o[t] = o[t] || {};
        o = o[t]
      }
      o[ts[0]] = record.get(map[i]);
    }

    res.usecases = JSON.parse(res.usecases);
    var f = JSON.parse(res.finance);
    res.costs = f.costs;
    res.financing = f.financing;
    res.techCapCosts = f.techCapCosts;
    res.doNothing = f.doNothing;

    console.log("Retrieved record:")
    console.log(res);
    callback(res);
  })
}

function createRecordFromPost(body, callback) {

  var dataModel = postDataToAirtableData(body);
  airtableBase('Applications').create(dataModel, function(err, record) {
    if (err) return callback();
    callback(record);
  });
}
 
function submitDigitalSelfassessment(body, callback) {
  var allRec = [];
  
  if (!body['Application ID']) {
        throw "Application ID required"
  }
  
  var filterFormula = "{Application ID} = " + body['Application ID']; 

  airtableBase('Applications').select({maxRecords:1, filterByFormula: filterFormula})
    .eachPage(function (records, next) {
      records.forEach(function (r) {allRec.push(r)});
      next();
    }, function(error) {
      body['Application ID'] = allRec[0] && allRec[0].id
        ? [ allRec[0].id ]
        : [];

      delete body['Application Type'];

      var tablename = body['CookieName'] === "selfassessment" ? 'Digital SA' : 'Technical SA';
      delete body['CookieName'];

      airtableBase(tablename).create(body, function(err, record) {
        if (err) return callback();
        callback(record);
      });    
    });
}

module.exports = {
  createRecordFromPost: createRecordFromPost,
  getRecord: getRecord,
  submitDigitalSelfassessment: submitDigitalSelfassessment
};