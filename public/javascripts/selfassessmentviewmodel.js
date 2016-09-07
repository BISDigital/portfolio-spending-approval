(function($) {

  var selfAssessment = window.selfassessment.Compiled;

	var SelfAssessmentModel = function() {
		var that = this;

    that.selfAssessmentIndex = ko.observable(-1);
    that.gotoNextUnansweredQuestion = function() {
      var sa = that.selfAssessmentQuestions();
      var nextIndex = sa.length;
      for (var i in sa) 
        if (!sa[i].answer()) {
          nextIndex = i;
          break;
        }
      setTimeout(function() {that.selfAssessmentIndex(nextIndex);}, 200); 
      return true;
    }
    that.decrementSelfAssessment = function() {that.selfAssessmentIndex(that.selfAssessmentIndex() -1)}

    that.clearAnswer = function(element) {
      element.answer("");
      that.gotoNextUnansweredQuestion();
      that.toggleAnswers(false);
    }

    that.showAnswers = ko.observable(false);
    that.toggleAnswers = function(newVal)  {
      if (newVal !== false && newVal !== true) newVal = !that.showAnswers();
      that.showAnswers(newVal);
    }

    

		that.applicationType = ko.observable(parseInt(getParameterByName("type")) || 1);    
    that.phase = ko.observable(parseInt(getParameterByName("phase")) || 1);
    
    //self assessment
    var allSelfAssessment = ko.observableArray(selfAssessment);
    that.selfAssessmentQuestions = ko.computed(function() {
      var sa = allSelfAssessment();
      var type = that.applicationType();
      var phase = type == 1 ? 1
        : type == 2 ? (that.phase() || 1)
        : type == 3 ? 4
        : -1;

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

    that._answeredQuestions = ko.computed(function() {
      var sa = that.selfAssessmentQuestions();
      var res = 0;
      for (var i in sa)
        if(!!sa[i].answer()) res++;
      return res;
    });

    //save and restore
    (function restore() {
      var old = JSON.parse(Cookies.get('selfassessment') || "{}");
      var qs = that.selfAssessmentQuestions();
      console.log(old.answers);
      for (var i in old.answers) {

        var id = old.answers[i].q;
        console.log(id);
        var match = $.grep(qs, function(x) {return x.id == id })[0];
        if (!match) continue;
        console.log(match);
        match.answer(old.answers[i].a);
      }
      if (old.idx) that.selfAssessmentIndex(old.idx);
    })();

    var storable = ko.computed(function() {
      var res = [];
      var qs = that.selfAssessmentQuestions();
      for (var i in qs) {
        res.push({q: qs[i].id, a: qs[i].answer() });
      }
      res.idx = that.selfAssessmentIndex();
      return {idx: that.selfAssessmentIndex(), answers: res};
    });
    storable.subscribe(function(newVals) {
      Cookies.set('selfassessment', JSON.stringify(newVals));
    })

    that.reset = function() {
      Cookies.set('selfassessment', "{}");
      window.location = window.location;
    }

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