(function($) {

  var selfAssessment = window.selfassessment.Compiled;
  var cookiename = window.cookiename;

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
      that.selfAssessmentIndex(nextIndex*2);
    }
    that.incrementSelfAssessment = function() {
      var next = that.selfAssessmentIndex() +1;
      setTimeout(function() {that.selfAssessmentIndex(next);}, 200); 
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

    
		that.phase = ko.observable(parseInt(getParameterByName("phase")) || 1);
    that.project = ko.observable(parseInt(getParameterByName("proj")) || 0);
    
    var _phasename = ko.computed(function() {
      var phase = that.phase();
      return phase == 1 ? "discovery"
        : phase == 2 ? "alpha"
        : phase == 3 ? "beta"
        : phase == 4 ? "live" : null;
    })

    //self assessment
    var allSelfAssessment = ko.observableArray(selfAssessment);
    that.selfAssessmentQuestions = ko.computed(function() {
      var sa = allSelfAssessment();
      var phasename = _phasename();
      
      if (!phasename) return [];

      var r = [];
      for (var i in sa) {
        if (sa[i].least_phase > that.phase()) continue;
        r.push({
          id: sa[i].id,
          question: sa[i].question,
          green: sa[i][phasename+"_green"],
          amber: sa[i][phasename+"_amber"],
          hasamber: sa[i][phasename+"_amber"] != "",
          red: sa[i][phasename+"_red"],
          answer: ko.observable(),
          comment: ko.observable()        
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

    //submit
    that.submit = function() {
      var data = {
        "Application ID": that.project(),
        "Phase": _phasename(),
        "CookieName": cookiename
      }

      var qs = that.selfAssessmentQuestions();
      for (var i in qs) {
        if (!qs[i].answer) continue;
        data[qs[i].id + " Answer"] = qs[i].answer();
        data[qs[i].id + " Answer Text"] = qs[i][qs[i].answer()];
        data[qs[i].id + " Comment"] = qs[i].comment();
      }

      $.post('/submitdigitalsa', data, function() {
        Cookies.set(cookiename, "{}");
        window.location = '/thanks';
      })
    };

    //save and restore
    (function restore() {
      var old = JSON.parse(Cookies.get(cookiename) || "{}");
      var qs = that.selfAssessmentQuestions();
      if(old && old.proj != that.project() || 
         old && old.phase != that.phase()) {        
        return;
      }

      for (var i in old.answers) {

        var id = old.answers[i].q;
        console.log(id);
        var match = $.grep(qs, function(x) {return x.id == id })[0];
        if (!match) continue;
        console.log(match);
        match.answer(old.answers[i].a);
        match.comment(old.answers[i].c);
      }
      if (old.idx) that.selfAssessmentIndex(old.idx - old.idx%2);
    })();

    var storable = ko.computed(function() {
      var res = [];
      var qs = that.selfAssessmentQuestions();
      for (var i in qs) {
        res.push({q: qs[i].id, a: qs[i].answer(), c: qs[i].comment() });
      }
      res.idx = that.selfAssessmentIndex();
      return {
        idx: that.selfAssessmentIndex(),
        proj: that.project(),
        phase: that.phase(),
        answers: res
      };
    });
    storable.subscribe(function(newVals) {
      Cookies.set(cookiename, JSON.stringify(newVals));
    })

    that.reset = function() {
      Cookies.set(cookiename, "{}");
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