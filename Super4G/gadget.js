var BASE_AGENT_API_URL_A = "https://" + UCCE_SIDE_B + "/unifiedconfig/config/agent/";
var BASE_AGENT_API_URL_B = "https://" + UCCE_SIDE_A + "/unifiedconfig/config/agent/";
var attributeRefURL = "/unifiedconfig/config/attribute/" + quizAttributeRefID;

var grade;
var agentDBID;

lookupTries = 0;

function putAgentGrade(putData){
  var url = BASE_AGENT_API_URL_A + agentDBID;

  var params = setRequestParams(gadgets.io.MethodType.PUT, putData);

  // This function will handle the request response.
  var requestCallback = function(response){
    if(response.rc === 200) {
      //console.log("putAgentGrade: success: ",response);
      var html = "<p>Congratulations! Your score was <strong>" + grade + " out of 10</strong>! You are now certified for the Super4G.</p>"

      // Now hide the quiz and display success message in the results div
      $("#evaluation").hide();
      document.getElementById('result').innerHTML = html;

      // Resize the gadget to accommodate the new size.
      gadgets.window.adjustHeight();
    }
    else {
      console.log("putAgentGrade: error: ",response);
      console.log("putAgentGrade: trying Side B...");
      putAgentGrade_B(putData);
    }
  }

  gadgets.io.makeRequest(url, createCallbackFunction.call(this, requestCallback, url, gadgets.io.MethodType.PUT, putData), params);
}

function putAgentGrade_B(putData){
  var url = BASE_AGENT_API_URL_B + agentDBID;

  var params = setRequestParams(gadgets.io.MethodType.PUT, putData);

  // This function will handle the request response.
  var requestCallback = function(response){
    if(response.rc === 200) {
      //console.log("putAgentGrade_B: success: ",response);
      var html = "<p>Congratulations! Your score was <strong>" + grade + " out of 10</strong>! You are now certified for the Super4G.</p>"

      // Now hide the quiz and display success message in the results div
      $("#evaluation").hide();
      document.getElementById('result').innerHTML = html;

      // Resize the gadget to accommodate the new size.
      gadgets.window.adjustHeight();
    }
    else {
      //console.log("putAgentGrade_B: error: ",response);
    }
  }

  gadgets.io.makeRequest(url, createCallbackFunction.call(this, requestCallback, url, gadgets.io.MethodType.PUT, putData), params);
}



// This function uses the PCCE REST api to get an agent's data. 
// Once we have the response, the data will be put into a message body 
// containing an agent attribute. The value of this attribute, is their quiz grade out of 10.
function getAgentDataAndCreatePutData(){
  var url = BASE_AGENT_API_URL_A + agentDBID;
  var timeparam = {
    time : (new Date()).getTime()
  };
  url += "?" + gadgets.io.encodeValues(timeparam);

  var params = setRequestParams(gadgets.io.MethodType.GET, null);

  // This function will handle the request response and use it to create new agent data.
  // This data will include the agent's new attribute value(quiz score).
  var requestCallback = function(response){
    try {
      var jsonObject = convertXMLtoJSON(response.text);

      // check if the agent has ANY attributes, if not. lets add the tag.
       if(jsonObject.agentAttributes == undefined){
        jsonObject.agentAttributes = {
          "agentAttribute": []
        };
      }

      // if value is not an array, make it one so that _.each iterates properly
      if(!_.isArray(jsonObject.agentAttributes.agentAttribute)){
        jsonObject.agentAttributes.agentAttribute = [jsonObject.agentAttributes.agentAttribute];
      }

      // This will iterate through each agent attribute, and if the name of the attribute matches the quiz attribute, we change the attribute value to our new grade.
      var set = false;
      _.each(jsonObject.agentAttributes.agentAttribute, function(attributeJSON){

        if(attributeJSON.attribute.refURL == attributeRefURL){
          attributeJSON.attributeValue = grade;
          set = true;
        }
      });

      // if set != true, that means the agent didn't already have that attribute.
      // lets add it to his already existing array of attributes
      if(set != true){
        jsonObject.agentAttributes.agentAttribute.push({
          "attribute": {"refURL": attributeRefURL},
          "attributeValue": grade
        });  
      }

      var putData = parseJSONtoXML("agent", jsonObject);
      putAgentGrade(putData);
    }
    catch (e) {
      // statements to handle any exceptions
      //console.log("getAgentDataAndCreatePutData: UCCE Side A error:",e);
      //console.log("getAgentDataAndCreatePutData: Trying Side B...");
      getAgentDataAndCreatePutData_B();
    }
  }
  
  gadgets.io.makeRequest(url, createCallbackFunction.call(this, requestCallback, url, gadgets.io.MethodType.GET, null), params);
}

function getAgentDataAndCreatePutData_B(){
  var url = BASE_AGENT_API_URL_B + agentDBID;
  var timeparam = {
    time : (new Date()).getTime()
  };
  url += "?" + gadgets.io.encodeValues(timeparam);

  var params = setRequestParams(gadgets.io.MethodType.GET, null);

  // This function will handle the request response and use it to create new agent data.
  // This data will include the agent's new attribute value(quiz score).
  var requestCallback = function(response){
    try{
      var jsonObject = convertXMLtoJSON(response.text);

      // check if the agent has ANY attributes, if not. lets add the tag.
       if(jsonObject.agentAttributes == undefined){
        jsonObject.agentAttributes = {
          "agentAttribute": []
        };
      }

      // if value is not an array, make it one so that _.each iterates properly
      if(!_.isArray(jsonObject.agentAttributes.agentAttribute)){
        jsonObject.agentAttributes.agentAttribute = [jsonObject.agentAttributes.agentAttribute];
      }

      // This will iterate through each agent attribute, and if the name of the attribute matches the quiz attribute, we change the attribute value to our new grade.
      var set = false;
      _.each(jsonObject.agentAttributes.agentAttribute, function(attributeJSON){

        if(attributeJSON.attribute.refURL == attributeRefURL){
          attributeJSON.attributeValue = grade;
          set = true;
        }
      });

      // if set != true, that means the agent didn't already have that attribute.
      // lets add it to his already existing array of attributes
      if(set != true){
        jsonObject.agentAttributes.agentAttribute.push({
          "attribute": {"refURL": attributeRefURL},
          "attributeValue": grade
        });  
      }

      var putData = parseJSONtoXML("agent", jsonObject);
      putAgentGrade_B(putData);
    }
    catch (e) {
      // statements to handle any exceptions
      //console.log("getAgentDataAndCreatePutData_B: UCCE Side B error:",e);
      //console.log("getAgentDataAndCreatePutData_B: Either the UCCE A and B sides are down, or the credentials in config.js are invalid");
      getAgentDataAndCreatePutData_B();
    }
  }

  gadgets.io.makeRequest(url, createCallbackFunction.call(this, requestCallback, url, gadgets.io.MethodType.GET, null), params);
}


function lookupDatabaseID(searchTerm){
  var url = BASE_AGENT_API_URL_A;
  var timeparam = {
    time : (new Date()).getTime()
  };
  url += "?" + gadgets.io.encodeValues(timeparam);
  url += "&q=" + searchTerm;

  var params = setRequestParams(gadgets.io.MethodType.GET, null);

  // This function will handle the request response and use it to create new agent data.
  // This data will include the agent's new attribute value(quiz score).
  var requestCallback = function(response){
    try {
      var jsonObject = convertXMLtoJSON(response.text);
      //console.log("lookupDatabaseID: ", jsonObject);
      var temp = jsonObject.agents.agent.refURL.split("/")
      agentDBID = temp[temp.length-1];
    }
    catch (e) {
    // statements to handle any exceptions
      //console.log("UCCE Side A error:",e); // pass exception object to error handler
      //console.log("Trying Side B...");
      lookupDatabaseID_B(searchTerm);
    }
  }
  
  gadgets.io.makeRequest(url, createCallbackFunction.call(this, requestCallback, url, gadgets.io.MethodType.GET, null), params);
}

function lookupDatabaseID_B(searchTerm){
  var url = BASE_AGENT_API_URL_B;
  
  var timeparam = {
    time : (new Date()).getTime()
  };
  url += "?" + gadgets.io.encodeValues(timeparam);
  url += "&q=" + searchTerm;

  var params = setRequestParams(gadgets.io.MethodType.GET, null);

  // This function will handle the request response and use it to create new agent data.
  // This data will include the agent's new attribute value(quiz score).
  var requestCallback = function(response){
    try {
      var jsonObject = convertXMLtoJSON(response.text);
    }
    catch (e) {
        // statements to handle any exceptions
        //console.log("UCCE Side B error:",e); // pass exception object to error handler
	    //console.log("Either the UCCE A and B sides are down, or the credentials in config.js are invalid");
    }
	//console.log("lookupDatabaseID: ", jsonObject);
    var temp = jsonObject.agents.agent.refURL.split("/")
    agentDBID = temp[temp.length-1];
  }
  
  gadgets.io.makeRequest(url, createCallbackFunction.call(this, requestCallback, url, gadgets.io.MethodType.GET, null), params);
}

function startEvaluation(){
  var popup=confirm("This will start the evaluation! Click OK to begin.");
  if (popup==true){
    $("#training").remove();
    $("#evaluation").show();

    gadgets.window.adjustHeight();
  }
}

function gradeTest() {
  var correctAnswers = 0;
  var form=document.forms["userQuiz"];
  
  if (form.question1[0].checked == true){
    correctAnswers++;
  }
  if (form.question2[0].checked == true){
    correctAnswers++;
  }
  if (form.question3[2].checked == true){
    correctAnswers++;
  }
  if (form.question4[2].checked == true){
    correctAnswers++;
  }
  if (form.question5[0].checked == true){
    correctAnswers++;
  }
  if (form.question6[0].checked == true){
    correctAnswers++;
  }
  if (form.question7[0].checked == true){
    correctAnswers++;
  }
  if (form.question8[0].checked == true){
    correctAnswers++;
  }
  if (form.question9[0].checked == true){
    correctAnswers++;
  }
  if (form.question10[0].checked == true){
    correctAnswers++;
  }

  grade = correctAnswers;
  if(grade >= 7){
    // do our makerequest, post data is chained off of this function since we need 
    // to wait for its response to return before we can send our actual PUT request with the data we fetched.
    getAgentDataAndCreatePutData();
  }
  else{
    var html = "<p>Sorry, your score was <strong>" + grade + " out of 10</strong> (7 out of 10 needed). Please study up and retry later.</p>"
    
    // Now hide the quiz and display fail message in the results div
    $("#evaluation").hide();
    document.getElementById('result').innerHTML = html;

    // Resize the gadget to accommodate the new size.
    gadgets.window.adjustHeight();
  }
}

function initData() {
  gadgets.window.adjustHeight();

  var agentID = prefs.getString("id");
  agentDBID = lookupDatabaseID(agentID);
}

gadgets.util.registerOnLoadHandler(initData);
