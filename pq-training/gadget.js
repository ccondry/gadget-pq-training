var finesse = window.finesse;
var clientLogs;
if (!finesse) {
	throw new Error("Finesse library is not available");
} else {
	var finesse = finesse || {};
	finesse.gadget = finesse.gadget || {};
	finesse.container = finesse.container || {};
	clientLogs = finesse.cslogger.ClientLogger || {};
}

/** @namespace */
finesse.modules = finesse.modules || {};
finesse.modules.CumulusTraining = (function ($) {
	var _cfg, _prefs;
	// global for Finesse Utilities (utility function object)
	var _util;
	// used to count the calls (dialogs)
	var numDialogs = 0;
	// the callvars array of callvariables
	var callvars = new Array();
	// gmaps center location
	var resultsLoaded = false;
	// requestTypes api response cache object

	var user, states, dialogs;


	var agentId;

	function getUrlVars (url) {
		var vars = {};
		var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi,
		function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}

	function getUrlParams () {
		//First get just the URI for this gadget out of the full finesse URI and decode it.
		let gadgetURI = decodeURIComponent(getUrlVars(location.search)["url"]);

		//Now get the individual query params from the gadget URI
		return getUrlVars(gadgetURI);
	}

	// configure the gadget using URL parameters
	function initData() {
		let urlParams = getUrlParams();

		// get the video URL, if any
		if (urlParams["video"]) {
			let videoUrl = decodeURIComponent(urlParams["video"]);
			console.log('pqtraining got video URL:',videoUrl)
			$("#trainingVideo").html('<source src="' + videoUrl + '" type="video/mp4"></source>');
			// make the new video load
			$("#trainingVideo")[0].load();
		}

		// get the agent ID, and look up the internal ID of the agent
		agentId = _prefs.getString("id");

		// get the marquee text, if any
		if (urlParams["marquee"]) {
			let marqueeText = decodeURIComponent(urlParams["marquee"]);

			// set the marquee text if the value exists
			if (marqueeText.length) {
				$("#trainingMarquee").html(marqueeText);
			}
		}

		// get the marquee text, if any
		let height = urlParams["height"];
		// set the marquee text if the value exists
		if (height) {
			$("#trainingVideo").attr('height', height);
		}

		// get the marquee text, if any
		let width = urlParams["width"];
		// set the marquee text if the value exists
		if (width) {
			$("#trainingVideo").attr('width', width);
		}

		// get the marquee text, if any
		let title = urlParams["title"];

		// set the marquee text if the value exists
		if (title) {
			gadgets.window.setTitle(decodeURIComponent(title));
		}

		// gadgets.window.adjustHeight();
	}

	function getAgentDataAndCreatePutData(grade) {
	  const url = 'https://branding.dcloud.cisco.com/api/v1/certification?agent=' + agentId + '&grade=' + grade
	  const params = {}
	  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST
	  function callback (response) {
	    if(response.rc >= 200 && response.rc < 300) {
	      var html = "<p>Congratulations! Your score was <strong>" + grade + " out of 10</strong>! You are now certified for the Cumulus.</p>"

	      // Now hide the quiz and display success message in the results div
	      $("#evaluation").hide();
	      document.getElementById('result').innerHTML = html;

	      // Resize the gadget to accommodate the new size.
	      // gadgets.window.adjustHeight()
	    } else {
	      // bad response code
	      console.log("putAgentGrade: error: ", response)
	      var html = "<p>Sorry, there was an error saving your quiz score.</p>"

	      // Now hide the quiz and display error message in the results div
	      $("#evaluation").hide();
	      document.getElementById('result').innerHTML = html;
	      // gadgets.window.adjustHeight()
	    }
	  }
	  // make the request
	  gadgets.io.makeRequest(url, callback, params)
	}

	// reset the UI back to the way it was when gadget initially loaded
	function resetUi () {
		// show initial training div
		$("#training").show();
		// hide the test
		$("#evaluation").hide();
		// hide any results
		$("#result").hide();
		// fix gadget height
		gadgets.window.adjustHeight()
	}

	function render() {
		var currentState = user.getState();
	}

	/** @scope finesse.modules.CumulusTraining */
	return {
		/**
		* Performs all initialization for this gadget
		*/
		init : function () {
			// For SSO deployment, Gadgets should use the finesse provided config
			// object instead of creating their own instance
			_cfg = finesse.gadget.Config;

			// Initiate the ClientServices and load the config object. ClientServices
			// are initialized with a reference to the current configuration.
			// For SSO deployments , gadgets need to initialize clientservices for
			// loading config object properly.Without initialization, SSO mode will not work
			finesse.clientservices.ClientServices.init(_cfg);
			_prefs = new gadgets.Prefs();
			clientLogs.init(gadgets.Hub, "CumulusTraining", finesse.gadget.Config); // this gadget id will be logged as a part of the message

			containerServices = finesse.containerservices.ContainerServices.init();
			// containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, _handleTabVisible);
			// containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.GADGET_VIEW_CHANGED_EVENT, _handleGadgetViewChanged);
			// containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.MAX_AVAILABLE_HEIGHT_CHANGED_EVENT, _handleMaxAvailableHeightChange);

			containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, function() {
				// log to Finesse logger
				clientLogs.log("Gadget is now visible");
				// fix gadget height
				gadgets.window.adjustHeight()
			});

			containerServices.makeActiveTabReq();

			// finesse.containerservices.ContainerServices.makeActiveTabReq();
			// user = new finesse.restservices.User({
			// 	id: finesse.gadget.Config.id,
			// 	onLoad : handleUserLoad,
			// 	onChange : handleUserChange
			// });

      gadgets.util.registerOnLoadHandler(gadgets.window.adjustHeight)

			_util = finesse.utilities.Utilities;


			states = finesse.restservices.User.States;
			/**
			* init user code
			*/
			initData()
			clientLogs.log("completed init");
		},

		gradeTest: function () {
			var correctAnswers = 0;
			var form=document.forms["userQuiz"];

			if (form.question1[0].checked == true){
				correctAnswers++;
			}
			if (form.question2[0].checked == true){
				correctAnswers++;
			}
			if (form.question3[1].checked == true){
				correctAnswers++;
			}
			if (form.question4[2].checked == true){
				correctAnswers++;
			}
			if (form.question5[0].checked == true){
				correctAnswers++;
			}
			if (form.question6[2].checked == true){
				correctAnswers++;
			}
			if (form.question7[0].checked == true){
				correctAnswers++;
			}
			if (form.question8[0].checked == true){
				correctAnswers++;
			}
			if (form.question9[2].checked == true){
				correctAnswers++;
			}
			if (form.question10[0].checked == true){
				correctAnswers++;
			}

			var grade = correctAnswers;
			if (grade >= 7) {
				// do our makerequest, post data is chained off of this function since we need
				// to wait for its response to return before we can send our actual PUT request with the data we fetched.
				getAgentDataAndCreatePutData(grade);
			} else {
				var html = "<p>Sorry, your score was <strong>" + grade + " out of 10</strong> (7 out of 10 needed). Please study up and retry later.</p>"

				// Now hide the quiz and display fail message in the results div
				$("#evaluation").hide();
				document.getElementById('result').innerHTML = html;

				// Resize the gadget to accommodate the new size.
				// gadgets.window.adjustHeight();
			}
			// reset UI back to initial state after 10 seconds
			setTimeout(resetUi, 10000)
		},

		startEvaluation: function () {
			$("#training").hide();
			$("#evaluation").show();
			// fix gadget height
			gadgets.window.adjustHeight()
		}
	};
}(jQuery));
