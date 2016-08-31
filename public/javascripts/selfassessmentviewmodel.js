(function($) {

  var selfAssessment = window.selfassessment.Compiled;

	var SelfAssessmentModel = function() {
		var that = this;

    that.selfAssessmentIndex = ko.observable(-1);
    that.incrementSelfAssessment = function(currentIndex) {
      return function() {setTimeout(function() {that.selfAssessmentIndex(currentIndex + 1);}, 200); return true;}
    }
    that.decrementSelfAssessment = function() {that.selfAssessmentIndex(that.selfAssessmentIndex() -1)}

		that.applicationType = ko.observable(parseInt(getParameterByName("type")) || 1);    
    that.phase = ko.observable(parseInt(getParameterByName("phase")) || 1);
    
    //self assessment
    var allSelfAssessment = ko.observableArray(selfAssessment);
    that.selfAssessmentQuestions = ko.computed(function() {
      var sa = allSelfAssessment();
      var phase = that.applicationType() == 1 ? 1
        : (that.phase() || 1);

      var phasename = 
          phase == 1 ? "discovery"
        : phase == 2 ? "alpha"
        : phase == 3 ? "beta"
        : phase == 4 ? "live" : null;

      if (!phasename) return [];

      var r = [];
      for (var i in sa) {
        if (sa[i].least_phase > phase) continue;
        r.push({
          id: sa[i].id,
          question: sa[i].question,
          green: sa[i][phasename+"_green"],
          amber: sa[i][phasename+"_amber"],
          hasamber: sa[i][phasename+"_amber"] != "",
          red: sa[i][phasename+"_red"],
          answer: ko.observable()          
        });
      }
      return r;
    });

    // source: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
	}

	ko.applyBindings(new SelfAssessmentModel());

})(jQuery);