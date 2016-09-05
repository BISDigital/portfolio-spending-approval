(function($) {
  var contactTemplate = function() {return {name:ko.observable(""), email:ko.observable(""), phone: ko.observable("")}};

  var financialYears = [
    {yearId: "2016", yearLabel: "2016/2017"},
    {yearId: "2017", yearLabel: "2017/2018"},
    {yearId: "2018", yearLabel: "2018/2019"},
    {yearId: "2019", yearLabel: "2019/2020"}
  ];

  var directorates = [
    {id: null, name: "Please select..."},
    {id: 1, name: "Directorate 1"},
    {id: 2, name: "Directorate 2"},
    {id: 3, name: "Directorate 3"}
  ];
  var applicationTypeOptions = [
    {id: 1, name: "Get approval for the Discovery phase of a new digital project"},
    {id: 2, name: "Get approval for the next phase (alpha, beta, live) of an existing digital project"},
    {id: 3, name: "Get approval for purchasing a service that could alternatively be provided by an Independent Shared Service Center"},
    {id: 4, name: "Get approval for technology expenditure"}
  ];

  var existingProjects = [
    {id: 1, name: "Project 1"},
    {id: 2, name: "Project 2"},
    {id: 3, name: "Project 3"}
  ];

  var digitalProjectPhases = [
    {id: null, name: "Please select..."},
    {id: 1, name: "We want to run a discovery project and build a prototype"},
    {id: 2, name: "We have a prototype and want to develop an alpha"},
    {id: 3, name: "We have an alpha and want to develop a beta"},
    {id: 4, name: "We have a beta and want to go live"}
  ];

  var businessCases = [
    {id: 0, name: "", label: "No - We don't have a Business Case Document"},
    {id: 1, name: "Strategic Outline Business Case (SOBC)", label: "Yes - We have a Strategic Outline Business Case (SOBC)"},
    {id: 2, name: "Outline Business Case (OBC)", label: "Yes - We have an Outline Business Case (OBC)"},
    {id: 3, name: "Full Business Case (FBV)", label: "Yes - We have been through a procurement; have a Full Business Case (FBC)"}
  ];

  var costBands = [
    {id: null, label: "Please select..."},
    {id: 1, label: "£100k or less"},
    {id: 2, label: "Between £100k and £1m"},
    {id: 3, label: "Between £1m and £5"},
    {id: 4, label: "Between £5m and £10m"},
    {id: 5, label: "£10m or more"}
  ];

  var costTypes = [
    {id: 1, name: "Technology capital expenditure"},
    {id: 2, name: "Technology operational expenditure"},
    {id: 3, name: "Non-technology operational expenditure"},
    {id: 4, name: "Transition or exit costs"}
  ];

  var financingTypes = [
    {id: 1, name: "Preapproved"},
    {id: 2, name: "Requested now"},
  ];

	var SurveyModel = function() {
		var that = this;

    that.d = {}; // data
    
    that.d.applicant = ko.observable(contactTemplate());
    that.d.applicationType = ko.observable("");    
    that.d.name = ko.observable("");
    that.d.mandates = ko.observable("");
    that.d.existingId = ko.observable(0);
		that.d.phase = ko.observable();
    that.d.businessCase = ko.observable();
    that.d.businessCaseDocument = ko.observable();
    that.removeBusinessCaseDocument = function() {that.d.businessCaseDocument("");}

    that.d.directorate = ko.observable();
    that.d.sro = ko.observable(contactTemplate());
    that.d.costBand = ko.observable(0);
    that.d.technology = ko.observable("");

    that._selfAssessmentLink = ko.computed(function() {
      //todo: have an application guid from the backend.
      return '/selfassessment?phase=' + (that.d.phase() || 1) + '&type=' + (that.d.applicationType() || 1); 
    })

    //nb!
    Cookies.set('selfassessment', "");

    that._assessmentLevel = ko.computed(function() {
      var cost = that.d.costBand(), type = that.d.applicationType();
      if (!cost || !type) return 0;
      if (cost == 5) return 3;
      if (type == 4 && cost >= 4
        || type == 3 && cost >= 3 
        ||type == 2 && cost >= 2
        ||type == 1) return 2;
      return 1;
    });

    that._daysForAssessment = ko.computed(function() {
      return that._assessmentLevel() == 3 ? 28 : 14;
    })

    that._askAboutProjectPhase = ko.computed(function() {
      return that.d.applicationType() == 2;
    })

    that._askAboutTech = ko.computed(function() {
      return true;
    })

    that._askAboutUseCase = ko.computed(function() {
      return that.d.applicationType() > 1;
    }) 

		
    that.d.usecases = ko.observableArray([]);
    that.addUsecase = function() {that.d.usecases.push({user: ko.observable(""), direct: ko.observable(0), usecase: ko.observable("")})};
    that.removeUsecase = function(x) {that.d.usecases.remove(x)};

    that.d.usecaseEvidence = ko.observable("");

    that.d.costs = {};
    for (var i in costTypes) {
      var costName = costTypes[i].name;
      that.d.costs[costName] = new CostModel();     
    }
    that.d.financing = {};
    for (var i in financingTypes) {
      var financingName = financingTypes[i].name;
      that.d.financing[financingName] = new CostModel();
    }
    that.d.doNothing = new CostModel();

    that.d.isMajorPortfolio = ko.observable();
    that.d.purchasetech = ko.observable();

    that.d.techCapCosts = ko.observableArray([]);
    that.addTechCapCost = function() {
      var x = new CostModel();
      x.name = ko.observable("");
      that.d.techCapCosts.push(x);
    }
    that.removeTechCapCost = function(x) {
      that.d.techCapCosts.remove(x);
    }
    that.addTechCapCost();

    that.d.govukexempt = ko.observable();

    that.d.noGovUkReason = ko.observable();
    that.d.govukexemptionfile = ko.observable();
    that.removegovukexemptionfile = function() {that.d.govukexemptionfile("");}
    that.d.url = ko.observable();
    that.d.assistedOutline = ko.observable();
    that.d.authentication = ko.observable();

    that.d.needsFasttrack = ko.observable("");
    that.d.fasttrackDeadline = ko.observable("");
    that.d.fasttrackReason = ko.observable("");

    //Financials: totals

    that._costTotals = {};
    that._financingTotals= {};
    that._balanceTotals = {};
    that._techCapCostTotals = {}

    for (var i in financialYears) {
      var id = financialYears[i].yearId;
      that._costTotals[id] = makeCostTotal(that.d.costs, id);
      that._financingTotals[id] = makeCostTotal(that.d.financing, id);
      that._techCapCostTotals[id] = makeCostTotal(that.d.techCapCosts, id);
    }
    for (var i  in financialYears) {
      var id = financialYears[i].yearId;
      that._balanceTotals[id] = makeBalanceTotal(that.d.doNothing, that._costTotals, id);
    }

    that._costGrandTotal = makeGrandTotal(that._costTotals);
    that._financingGrandTotal = makeGrandTotal(that._financingTotals);
    that._balanceGrandTotal = makeGrandTotal(that._balanceTotals);
    that._techCapCostGrandTotal = makeGrandTotal(that._techCapCostTotals);
    

		  
    //select options
    that.directorates = ko.observableArray(directorates);
    that.existingProjects = ko.observableArray(existingProjects);
    that.availableCostBands = ko.observableArray(costBands);
    that.digitalProjectPhases = ko.observableArray(digitalProjectPhases);
    that.businessCases = ko.observableArray(businessCases);
    that.applicationTypeOptions = ko.observableArray(applicationTypeOptions);
    that.financialYears = ko.observableArray(financialYears);
    that.costTypes = ko.observableArray(costTypes);
    that.financingTypes = ko.observableArray(financingTypes);

    //paging

    that.d.page = ko.observable(1);
    that.nextpage = offsetPage(1);
    that.previouspage = offsetPage(-1);

    function offsetPage(offset) {
      return function() {
        var target = that.d.page() + offset;
        if (target == 4 && that.d.applicationType() >= 3) target += offset; //skip website questions for non-digital projects
        window.scrollTo(0,0);
        that.d.page(target);
      }
    }

    // save and restore
    var arraysOfCostModels = ['costs', 'financing', 'techCapCosts'];
    var costModels = ['doNothing'];
    var people = ['applicant', 'sro'];
    var restore = function() {
      var old = JSON.parse(Cookies.get('application') || "{}");
      console.log(old);
      for (var x in old) {
        if (old[x] == null || old[x] == undefined || !that.d[x]) {
          continue;
        }
        if (arraysOfCostModels.indexOf(x) > -1) {
          for (var y in old[x]) {
            if (!(that.d[x][y])) continue;
            that.d[x][y].set(old[x][y])
          }
        } else if (costModels.indexOf(x) > -1) {
          that.d[x].set(old[x]); 
        } else if (people.indexOf(x) > -1) {
          that.d[x]().name(old[x].name);
          that.d[x]().email(old[x].email);
          that.d[x]().phone(old[x].phone);          
        } else {
          that.d[x](old[x]); 
        }
      }
    };
    restore();

    that.reset = function() {
      Cookies.set('application', '{}');
      window.location = window.location;
    }

    that._state = ko.computed(function() {
      var res = {};
      for (var x in that.d) {
          if (arraysOfCostModels.indexOf(x) > -1) {
            res[x] = {};
            for(var y in that.d[x]) {
              if (!(that.d[x][y] instanceof CostModel)) continue;
              res[x][y] = that.d[x][y].storable();
            }
          } else if (costModels.indexOf(x) > -1) {
            res[x] = that.d[x].storable();
          } else if (people.indexOf(x) > -1) {
            res[x] = {name: that.d[x]().name(), email: that.d[x]().email(), phone: that.d[x]().phone()};
          }
          else {
            res[x] = that.d[x]();  
          }         
      }
      return res;
    });
    that._state.subscribe(function save(state) {
        Cookies.set('application', JSON.stringify(state));
    })
	}

  function CostModel() {
    var self = this;
    for (var j in financialYears) {
      self[financialYears[j].yearId] = ko.observable();
    }
    self.storable = ko.computed(function() {
      var res = {};
      for (var l in financialYears) {
        var id = financialYears[l].yearId;
        res[id] = self[id]();
      }
      return res;
    });
    self.set = function (newVals) {
      for (var l in financialYears) {
        var id = financialYears[l].yearId;
        if (!self[id] || !newVals[id]) continue;
        self[id](newVals[id]);
      }
    }
    this.total = ko.computed(function() {        
      var t = 0;
      for (var l in financialYears) {
        var id = financialYears[l].yearId;
        var val = self[id]();
        t += (parseInt(val) || 0);
      }
      return t;
    });
  }

  function makeCostTotal(_costs, yearId) {
    return ko.computed(function() {
      var costs = $.isFunction(_costs) ? _costs() : _costs;
      var t = 0;
      for (var i in costs) {
        t += (parseInt(costs[i][yearId]()) || 0);
      }
      return t;
    })
  }
  function makeBalanceTotal(totals1, totals2, yearId) {
    return ko.computed(function() {
      var t1 = (totals1[yearId]() || 0);
      var t2 = (totals2[yearId]() || 0);
      return t1-t2;
    })
  }
  function makeGrandTotal(totals) {
    return ko.computed(function() {
      var t = 0;
      for (var i in totals) {
        t += totals[i]();
      }
      return t; 
    })   
  }
  

	ko.applyBindings(new SurveyModel());

})(jQuery);