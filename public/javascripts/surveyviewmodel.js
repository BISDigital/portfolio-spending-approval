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

		that.applicationType = ko.observable("");    
    that.name = ko.observable("");
    that.mandates = ko.observable("");
    that.existingId = ko.observable(0);
		that.phase = ko.observable();
    that.businessCase = ko.observable();
    that.businessCaseDocument = ko.observable();
    that.removeBusinessCaseDocument = function() {that.businessCaseDocument("");}

    that.directorate = ko.observable();
    that.sro = ko.observable(contactTemplate());
    that.costBand = ko.observable(0);
    that.technology = ko.observable("");

    that._selfAssessmentLink = ko.computed(function() {
      //todo: have an application guid from the backend.
      return '/selfassessment?phase=' + (that.phase() || 1) + '&type=' + (that.applicationType() || 1); 
    })

    that._assessmentLevel = ko.computed(function() {
      var cost = that.costBand(), type = that.applicationType();
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
      return that.applicationType() == 2;
    })

    that._askAboutTech = ko.computed(function() {
      return true;
    })

    that._askAboutUseCase = ko.computed(function() {
      return that.applicationType() > 1;
    }) 

		that.applicant = ko.observable(contactTemplate());
		
    that.usecases = ko.observableArray([]);
    that.addUsecase = function() {that.usecases.push({user: ko.observable(""), direct: ko.observable(0), usecase: ko.observable("")})};
    that.removeUsecase = function(x) {that.usecases.remove(x)};

    that.usecaseEvidence = ko.observable("");

    that.costs = {};
    for (var i in costTypes) {
      var costName = costTypes[i].name;
      that.costs[costName] = new CostModel();     
    }
    that.financing = {};
    for (var i in financingTypes) {
      var financingName = financingTypes[i].name;
      that.financing[financingName] = new CostModel();
    }
    that.doNothing = new CostModel();

    that.isMajorPortfolio = ko.observable();
    that.purchasetech = ko.observable();

    that.techCapCosts = ko.observableArray([]);
    that.addTechCapCost = function() {
      var x = new CostModel();
      x.name = ko.observable("");
      that.techCapCosts.push(x);
    }
    that.removeTechCapCost = function(x) {
      that.techCapCosts.remove(x);
    }
    that.addTechCapCost();

    that.govukexempt = ko.observable();

    that.noGovUkReason = ko.observable();
    that.govukexemptionfile = ko.observable();
    that.removegovukexemptionfile = function() {that.govukexemptionfile("");}
    that.url = ko.observable();
    that.assistedOutline = ko.observable();
    that.authentication = ko.observable();


    that.needsFasttrack = ko.observable("");
    that.fasttrackDeadline = ko.observable("");
    that.fasttrackReason = ko.observable("");

    //Financials: totals

    that._costTotals = {};
    that._financingTotals= {};
    that._balanceTotals = {};
    that._techCapCostTotals = {}

    for (var i in financialYears) {
      var id = financialYears[i].yearId;
      that._costTotals[id] = makeCostTotal(that.costs, id);
      that._financingTotals[id] = makeCostTotal(that.financing, id);
      that._techCapCostTotals[id] = makeCostTotal(that.techCapCosts, id);
    }
    for (var i  in financialYears) {
      var id = financialYears[i].yearId;
      that._balanceTotals[id] = makeBalanceTotal(that.doNothing, that._costTotals, id);
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
    that.page = ko.observable(1);
    that.nextpage = offsetPage(1);
    that.previouspage = offsetPage(-1);

    function offsetPage(offset) {
      return function() {
        var target = that.page() + offset;
        if (target == 4 && that.applicationType() >= 3) target += offset; //skip website questions for non-digital projects
        window.scrollTo(0,0);
        that.page(target);
      }
    }
	}

  function CostModel() {
    var self = this;
    for (var j in financialYears) {
      self[financialYears[j].yearId] = ko.observable();
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