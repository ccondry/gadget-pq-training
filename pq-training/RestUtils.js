function createAuthHeader() {
//prefs.getString("authorization");
  return "Basic " + authString;
}

/*function setAuthParams(params){
  var authHeader = createAuthHeader();
  if (authHeader == "")
    return;

  params[gadgets.io.RequestParameters.AUTHORIZATION] = authHeader;
}*/

function setAuthParams(params){
  var authHeader = createAuthHeader();
  if (authHeader == "")
    return;

  if (params[gadgets.io.RequestParameters.HEADERS] == null) {
    params[gadgets.io.RequestParameters.HEADERS] = {
      "Authorization" : authHeader
    };
  } else {
    var headers = params[gadgets.io.RequestParameters.HEADERS];
    headers["Authorization"] = authHeader;
  }
}

function setRequestParams(method, data){
  var params = {};

  switch(method){
    case gadgets.io.MethodType.GET :
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
        params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
        params[gadgets.io.RequestParameters.HEADERS] = {
          "Cache-Control" : "no-cache"
        };
    break;
    case gadgets.io.MethodType.PUT :
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
      params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
      params[gadgets.io.RequestParameters.POST_DATA] = data;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "Content-Type" : "application/xml;charset=UTF-8"
      };
    break; 
  }

  setAuthParams(params);

  return params;
}

function createCallbackFunction(callback, url, method, postdata){
  var that = this;
  var callbackWrapper = function(obj) {
    callback.call(that, obj, true);
  };

  return callbackWrapper;
}

function convertNestedJSONtoXML(jsonObject){
  var xml = "";

  for (var key in jsonObject){
    if(_.isArray(jsonObject[key])){
      _.each(jsonObject[key],function(item){
        xml += "<" + key + ">";
        xml += convertNestedJSONtoXML(item);
        xml += "</" + key + ">";
      })
    }
    else if(typeof jsonObject[key] =='object'){
      //It is JSON, call this recursively
      xml += "<" + key + ">";
      xml += convertNestedJSONtoXML(jsonObject[key]);
      xml += "</" + key + ">";
    }
    else{
      xml += "<" + key + ">";
      xml += jsonObject[key];
      xml += "</" + key + ">";
    }
  }

  return xml;
}

// This function is a wrapper around convertNestedJSONtoXML.
// It takes our JSON object and converts it back into XML
function parseJSONtoXML(objectName, object){
  return "<" + objectName + ">" + convertNestedJSONtoXML(object) + "</" + objectName + ">";
}

function convertXMLtoJSON(xml) {
  if (!xml) return;

  var elementToJs = function(element) {

    //If the element has no children, return its text (if any)
    if ($(element).children().length == 0) {
      return element.textContent || element.text;
    }

    var result = {};

    _.each($(element).children(), function(element) {

      var v = elementToJs(element);
      if (v) {
        if (element.tagName in result && !_.isArray(result[element.tagName])) {
          var r = [result[element.tagName]];
          result[element.tagName] = r;
        }
        if(_.isArray(result[element.tagName])) result[element.tagName].push(v);
        else result[element.tagName]=v;
      }

    });

    return result;
  };

  var xml = $.parseXML(xml);
  var obj = elementToJs(xml);
  var keys = _.keys(obj);
  if (keys.length == 1)
  obj = obj[keys[0]];
  return obj;
}
