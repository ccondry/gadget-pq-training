// Video Portal Dectector Priority Settings
/*var mediaPreferencePriorityDefault = {
  "Explorer" : ['wmv', 'flash', 'quicktime'],
  "Mozilla" : [ 'flash', 'quicktime', 'wmv'],
  "Safari" : [ 'quicktime', 'flash']
};*/
var playerMode="player";
var ccsid ="1";
var mediaPreferencePriority = {};
OSName="Unknown";
collapse = "true";
DmsEmbedLib = function () {
  this.videos = [];
  this.findProtocol = /^[^:]+/;
  this.portalBaseUrl = 'obsolete';
  this.videoWidth = 480;
  this.videoHeight = 270;
  this.flashHeight = 350
  if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
  if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
  if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
  if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
};

DmsEmbedLib.prototype.addVideo = function (videoBean) {
  this.videos.push(videoBean);
  return this;
};

DmsEmbedLib.prototype.getVideos = function () {
  return this.videos;
};

DmsEmbedLib.prototype.clear = function () {
  this.videos = [];
};

DmsEmbedLib.prototype.getEnv = function() {
  var uaInfo = {ie:0,opera:0,gecko:0,webkit:0,mobile:null,wmv:0,quicktime:0,flash:0,activex:0};
  var findWmp = /windows\s+media\s+player/i;
  var findFlip4mac = /flip4mac\s+windows\s+media\s+plugin/i; //ITC
  var findFlash = /flash/i;
  var findQT = /quicktime[^\d]+(\d+\.*\d*)/i;
  var findVersion = /(\d+\.\d+)/;
  var findActiveX = /activex/i;
  var ua = navigator.userAgent, m;
  var findIeFlashVersion = /\s(\d+),(\d+)/;
  // Modern KHTML browsers should qualify as Safari X-Grade
  if ((/KHTML/).test(ua)) {
    uaInfo.webkit = 1;
  }
  // Modern WebKit browsers are at least X-Grade
  m = ua.match(/AppleWebKit\/([^\s]*)/);
  if (m && m[1]) {
    uaInfo.webkit = parseFloat(m[1]);
    // Mobile browser check
    if (/ Mobile\//.test(ua)) {
      uaInfo.mobile = "Apple";
      // iPhone or iPod Touch
    }
    else {
      m = ua.match(/NokiaN[^\/]*/);
      if (m) {
        uaInfo.mobile = m[0];
        // Nokia N-series, ex: NokiaN95
      }
    }
  }

  if (!uaInfo.webkit) { // not webkit
    // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
    m = ua.match(/Opera[\s\/]([^\s]*)/);
    if (m && m[1]) {
      uaInfo.opera = parseFloat(m[1]);
      m = ua.match(/Opera Mini[^;]*/);
      if (m) {
        uaInfo.mobile = m[0];
        // ex: Opera Mini/2.0.4509/1316
      }
    }
    else { // not opera or webkit
      m = ua.match(/MSIE\s([^;]*)/);
      if (m && m[1]) {
        uaInfo.ie = parseFloat(m[1]);
      }
      else { // not opera, webkit, or ie
        m = ua.match(/Gecko\/([^\s]*)/);
        if (m) {
          uaInfo.gecko = 1;
          // Gecko detected, look for revision
          m = ua.match(/rv:([^\s\)]*)/);
          if (m && m[1]) {
            uaInfo.gecko = parseFloat(m[1]);
          }
        }
      }
    }
  }

  if (uaInfo.ie != 0) {
    if (window.ActiveXObject) {
      //WMP
      uaInfo.activex = 1;
      try {
        var objMediaPlayer = new ActiveXObject("WMPlayer.OCX");
        if (objMediaPlayer != null) {
          uaInfo.wmv = 1;
        }
        try {
          uaInfo.wmv = parseFloat(objMediaPlayer.versionInfo)
        } catch (e2) {
        }
      } catch(e1) {
      }
      //Flash
      try {
        var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        if (axo != null) {
          uaInfo.flash = 1;
        }
        var version = axo.GetVariable("$version") + '';
        if (findIeFlashVersion.test(version)) {
          uaInfo.flash = parseFloat(RegExp.$1 + '.' + RegExp.$2);
        }
      } catch (e) {
      }
      //Quicktime
      try {
        //not using QuickTimeCheckObject.QuickTimeCheck because it generates a prompt in IE7
        var axo = new ActiveXObject('QuickTime.QuickTime');
        if (axo != null) {
          uaInfo.quicktime = 1;
        }
      }
      catch(e) {
      }
    }
  }
  //Firefox/Mozilla/Safari plugin detection
  else if (uaInfo.gecko != 0 || uaInfo.webkit != 0) {
    for (var i=0; i < navigator.plugins.length; i++) {
      var plugInObj = navigator.plugins[i];
      var plugInName = plugInObj.name;

      if (findQT.test(plugInName)) {
        uaInfo.quicktime = RegExp.$1;
      }
      else if (findFlash.test(plugInName)) {
        if (findVersion.test(plugInObj.description)) {
          uaInfo.flash = RegExp.$1;
        }
        else {
          uaInfo.flash = 1;
        }
      }
      else if (findWmp.test(plugInName) || findFlip4mac.test(plugInName)) {	  //ITC support for flip4mac
        uaInfo.wmv = 1;
      }
      else if (findActiveX.test(plugInName)) {
        uaInfo.activex = 1;
      }
    }
  }
  return uaInfo;
};
DmsEmbedLib.prototype.getInternetExplorerVersion = function(){
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
};

DmsEmbedLib.prototype.getSimplePlayer = function (ccsid,url,play,width) {
	return this.createPlayer(ccsid,url,play,width,"Embed");
}


DmsEmbedLib.prototype.getExtendedPlayer = function (ccsid,url,play,width,collapsed) {
	this.collapse = collapsed;
	return this.createPlayer(ccsid,url,play,width,"ExtendedEmbed");
}

DmsEmbedLib.prototype.createPlayer = function (ccsid,url,play,width,type) {
  var vidObj = this.getVideos()[0];
  this.ccsid = ccsid;
  var fullUrl = url ;
  var findBaseUrl = /(.+\/vportal)/;
  var baseUrl = null;
  this.playerMode = "embed";
  var playerControlHeight = 50;
  if (findBaseUrl.test(fullUrl)) {
		baseUrl = RegExp.$1;
  }
  this.portalBaseUrl  = baseUrl;
  var browser = null;
  var env = this.getEnv();
  var uaHasWMV = (env.wmv > 0);
  var uaHasFlash = (env.flash > 5);
  if (env.gecko > 0) {
    browser = "Mozilla";
 }
  else if (env.ie > 0) {
    browser = "Explorer";
	version = this.getInternetExplorerVersion();
	if(version < 7.0){
		s ='<div id="xflashLayer"  style=" width:' +this.videoWidth +'px; border-width: 0px;  height:'+this.flashHeight +'px; z-index:11; visibility:visible">Upgrade to the latest version of IE inorder to view this video</div>';
		return s;
	}
  }
  else if (env.webkit > 0) {
    browser = "Safari";
  }
	if(width != null){
	 if(width < 340){
		this.videoWidth = 340;
	  }else{
		this.videoWidth = width;
	  }
	}else{
		this.videoWidth = 480;
	}
	this.flashWidth= this.videoWidth;
	var xflashLayer = "xflashLayer";
	var finalCcsid = null;
	finalCcsid = ccsid.split(":")[0];
  	if(type =="ExtendedEmbed"){
		//this.flashWidth= 2*this.videoWidth + 20;
		xflashLayer = xflashLayer+finalCcsid;
	}
  var protocol = /\:+/g;
  
  this.videoHeight = 9*this.videoWidth/16;
  this.flashHeight = this.videoHeight + playerControlHeight;
  s = '<script type="text/javascript" src="'+ this.portalBaseUrl +'/scripts/videoplayer/videoPlayerHeader.js"></script>'+this.getPreLoader() 
		+' \n ' + '<div id="'+xflashLayer+'"  style="border-width: 0px; z-index:11; visibility:visible">'
		+' \n ' + '<script type="text/javascript">'
		+' \n ' + 'if(!detectFlash()){ var alternateContent = "Alternate HTML content should be placed here.This content requires the Adobe Flash Player.<a href=http://www.adobe.com/go/getflash/>Get Flash</a>"'
		+' \n ' + 'document.write(alternateContent); } ;</script>';
			
  
  //if (uaHasFlash && uaHasWMV) {
	  if (browser == "Mozilla") {
		
		if(type =="ExtendedEmbed"){
			return s+' \n ' +this.getGeckoWmvPlayer(finalCcsid)+" \n "+this.getFlashPlayer(finalCcsid,url,play,type,browser) +" \n "+ "</div>";
		}else{
			return s+' \n ' +this.getGeckoWmvPlayer(finalCcsid)+" \n "+this.getFlashPlayer(finalCcsid,url,play,type,browser) +" \n "+ "</div>";
		}
      }else{
			if(browser != "Safari"){
				if(type =="ExtendedEmbed"){
					return s+' \n '+  this.getWmvPlayer(finalCcsid) + " \n " +  this.getFlashPlayer(finalCcsid,url,play,type,browser) + "\n</div>";
				}else{
					return s+' \n '+  this.getWmvPlayer(finalCcsid) + " \n " +  this.getFlashPlayer(finalCcsid,url,play,type,browser) + "\n</div>";
				}
			}else{
				//ITC Safari support same as Mozilla.
				if(type =="ExtendedEmbed"){
					return s+' \n ' +this.getGeckoWmvPlayer(finalCcsid)+" \n "+this.getFlashPlayer(finalCcsid,url,play,type,browser) +" \n "+ "</div>";
				}else{
					return s+' \n ' +this.getGeckoWmvPlayer(finalCcsid)+" \n "+this.getFlashPlayer(finalCcsid,url,play,type,browser) +" \n "+ "</div>";
				}				
			}
	  }
    //}
 
};

DmsEmbedLib.prototype.hasValidVideo = function (fullUrl) {
  if (fullUrl == null || fullUrl == '') {
    return false;
  }
  var processedUrl = fullUrl.replace(this.findProtocol, '');
  processedUrl = processedUrl.replace(' ', '');
  if (processedUrl.length < 3) {
    return false;
  }
  return true;
};

DmsEmbedLib.prototype.getNoPlayerMessage = function () {
  return 'sorry, you do not have the player needed to show this video';
};

DmsEmbedLib.prototype.renderActiveXQtMediaPlugin = function(ccsid) {
var s = '<div id="videoLayer'+ccsid+'" style="position:absolute; width:'+this.width+'px; height:'+this.height +'px;z-index:10; visibility:hidden">\n';
	s += '<OBJECT id="Player'+ccsid+'" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"  codebase="http://www.apple.com/qtactivex/qtplugin.cab" ';
	s += 'style="position:absolute;left:-1000px;z-index:1" ';
	s += 'width="' +this.width+ '" ';
	s += 'height="' +this.height+ '" ';
	s += '>';
	s += this.tag_param("controller", "false");    
	s += this.tag_param("kioskmode", "true");    
	s += this.tag_param("cache", "false");    
	s += this.tag_param("scale", "Aspect");    
	s += this.tag_param("autoplay", "false");    
	s += '</OBJECT>';
	s += '\n</div>';
	return s;
};

// Mozilla plugin
DmsEmbedLib.prototype.renderEmbedQtMediaPlugin= function ( w, h, ccsid ) {
	var s = '<div id="videoLayer'+ccsid+'" style="position:absolute; width:'+w +'px; height:'+h +'px;z-index:10; visibility:hidden">\n';
		s += '<EMBED id="Player'+ccsid+'" xname="Player'+ccsid+'" type="video/quicktime" ';
		s += 'style="position:absolute;left:-1000px;z-index:1" ';
		s += 'enablejavascript="true" ';
		s += 'width="' + w + '" ';
		s += 'height="' + h + '" ';
		s += 'scale="Aspect" ';
		s += 'autoplay="false" ';
		s += 'controller="false" ';
		s += 'bgcolor="#000000" ';
		s += 'autoplay="false" ';
		s += 'cache="false" ';
		s += '>';
		s += '</EMBED>';
		s += '\n</div>';
	return s
};

DmsEmbedLib.prototype.tag_param= function (k,v) {
	return "<PARAM NAME=\"" + k + "\" VALUE=\"" + v + "\">\n";
};

DmsEmbedLib.prototype.sampleQtPlayer = function (ccsid,url) {
return	'<object id="Player'+ccsid+'"  class="quicktime" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab#version=7,3,0,0" width="480px" height="270px">'+
       '<param name="src" value="'+url+'">'+
	   '<param name="scale" value="aspect">'+
	   '<param name="postdomevents" value="true">'+
	   '<embed id="Player'+ccsid+'" scale="aspect" showlogo="false" postdomevents="true" type="video/quicktime" src="'+url+'" width="480px" height="270px">'+
	   '<param name="autostart" value="true">'+
	   '<param name="cache" value="true">'+
	   '</object>';
	   
};
DmsEmbedLib.prototype.getQtPlayer = function (ccsid) {
  return '<div id="videoLayerQuicktime'+ccsid+'" style="position:absolute; width:'+this.videoWidth +'px; height:'+this.videoHeight +'px;z-index:10; visibility:hidden">\n'+
		 '<!--[if IE]><object id="qt_event_source" classid="clsid:CB927D12-4FF7-4a9e-A169-56E4B8A75598"></object><![endif]-->\n' +
			 '<OBJECT id="QuicktimePlayer'+ccsid+'" style="behavior:url(#qt_event_source);" class="quicktime" CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" CODEBASE="https://www.apple.com/qtactivex/qtplugin.cab#version=7,3,0,0" HEIGHT="' + this.videoHeight + '" WIDTH="' + this.videoWidth + '" >\n' +
			 '<PARAM NAME="AUTOPLAY" VALUE="false" />\n' +
			 '<PARAM NAME="Scale" VALUE="Aspect" />\n' +
			 '<PARAM NAME="Controller" VALUE="false" />\n' +
			 '<PARAM NAME="Kioskmode" VALUE="true" />\n' +
			 '<PARAM NAME="Cache" VALUE="false" />\n' +
			 '<param name="type" value="video/quicktime"/>\n' +
			 '<param value="true" name="postdomevents"/>\n' +
			 '<param name="target" value="QuickTimePlayer""/>\n' +
			 '<param name="ENABLEJAVASCRIPT" value="true"/>\n' +
			 '<EMBED id="QuicktimePlayer'+ccsid+'" ENABLEJAVASCRIPT="true" postdomevents="true" target="QuickTimePlayer" CACHE="false" KIOSKMODE="true" CONTROLLER="false" SCALE="Aspect" HEIGHT="' + this.videoHeight + '" WIDTH="' + this.videoWidth + '" AUTOPLAY="false" TYPE="video/quicktime" PLUGINSPAGE="http://www.apple.com/quicktime/download/" />\n' +
			 '</OBJECT>\n<script type="text/javascript">\n' +

"function loadQt () {\n" +
"  playerObj = document.getElementById('QuicktimePlayer" + ccsid + "');\n" +
"  if (playerObj != null && document.addEventListener) {\n" +
"    playerObj.addEventListener('qt_play', function () {dmsEmbed.recordPlay('" + ccsid + "');}, false);\n" +
"  }\n" +
"  else if (playerObj != null && window.attachEvent != 'undefined') {\n" +
"    playerObj.attachEvent('onqt_play', function () {dmsEmbed.recordPlay('" + ccsid + "');});\n" +
"  }\n" +
"}\n\n" +
"if (window.addEventListener) {\n" +
"  window.addEventListener('load', loadQt, false);\n" +
"}\n" +
"else if (window.attachEvent) {\n" +
"  window.attachEvent('onload', loadQt);\n" +
"}\n" +
         
"\n</script>"+
'\n</div>';
	
};

DmsEmbedLib.prototype.getWmvPlayer = function (ccsid) {
  s='<div id="videoLayer'+ccsid+'" style="position:absolute; width:'+this.videoWidth +'px; height:'+this.videoHeight +'px;z-index:10; visibility:hidden">\n'+
		'<OBJECT name="Player'+ccsid+'"  type="application/x-ms-wmp"  id="Player'+ccsid+'"  width="' + this.videoWidth + 'px" height="' + this.videoHeight + 'px" ' +
        ' CLASSID="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6" type="application/x-oleobject">	' +
        '	<PARAM NAME="SendPlayStateChangeEvents" VALUE="True">' +
        '	<PARAM name="AutoStart" value="false">'+
		'	<PARAM name="uiMode" value="none">'+    
		'</OBJECT>\n' +
		 this.getEventListener(ccsid)+
	'\n</div>';
		
	if(OSName == "MacOS"){
		s = '';
	}
	return s;
};

DmsEmbedLib.prototype.getGeckoWmvPlayer = function (ccsid) {
	s = '<div id="videoLayer'+ccsid+'" style="position:absolute; width:'+this.videoWidth +'px; height:'+this.videoHeight +'px;z-index:10; visibility:hidden">\n'+
		 '<OBJECT name="Player'+ccsid+'" id="Player'+ccsid+'" type="application/x-ms-wmp" width="' + this.videoWidth + 'px" height="' + this.videoHeight + 'px">	' +
         '	<param name="clsid" value="6BF52A52-394A-11D3-B153-00C04F79FAA6">' +
		 '	<PARAM name="AutoStart" value="false">' +
		 '	<PARAM name="uiMode" value="none">'+    
		 '</OBJECT>\n' +
		 this.getEventListener(ccsid)+
		'\n</div>';
		
	//ITC support for Mac
	if(OSName == "MacOS"){
		var env = this.getEnv();
		var locUrl = document.location.href;
		var bUrl = "";
		if (locUrl.indexOf('vportal/') != -1) {
			bUrl = locUrl.substring(0, locUrl.indexOf('vportal/') + 8);
		}
		
		if (env.wmv > 0) {
			s = '<div id="videoLayer'+ccsid+'" style="position:absolute; width:' + this.videoWidth + 'px; height:' + this.videoHeight + 'px;z-index:10; visibility:hidden">\n' +
			'<embed id="Player'+ccsid+'" name="Player'+ccsid+'" type="application/x-mplayer2" ' +
			' pluginspage="http://www.microsoft.com/windows/windowsmedia/player/wmcomponents.mspx"' +
			' autostart=0	showcontrols=0 	  showaudiocontrols=0 	  showpositioncontrols=0 	 ' +
			' showtracker=0 	  showdisplay=0 	  showgotobar=0 	  showstatusbar=0 	  animationatstart=0 	  width="' +
			this.videoWidth +
			'" height="' +
			this.videoHeight +
			'"' +
			' baseURL="'+bUrl+'"'+
			' src="" vspace="0" hspace="0"' +
			' border="0"  >	  </embed>';
			s += '\n</div>';
			s += '<div id="framelayer" style="visibility:hidden"><iframe name="rightframe" id="rightframe" style="visibility:hidden" src="" width="1" height="1"></iframe></div>';
		}else{
			s = '';
		}
	}			
	return s;
};

//use FlowPlayer 
DmsEmbedLib.prototype.getFlashPlayer = function  (ccsid,url,play,type,browser) {
		if(browser =="Explorer" ){
			s = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+
				'id="'+type+'-1.0-SNAPSHOT'+ccsid+'" width="'+this.flashWidth +'px" height="'+this.flashHeight +'px"'+
				'>'+
				'<param name="src" value="'+this.portalBaseUrl+'/swf/'+type+'-1.0-SNAPSHOT.swf" />'+
				'<param name="quality" value="high" />'+
				'<param name="allowScriptAccess" value="always" />'+
				'<param name="flashVars" value="baseurl='+ url+'&play='+play+'&embedurl='+window.location.href+'&collapse='+this.collapse+'" />'+
				'<param name="wmode" value="transparent" />'+
				'<param name="play" value="true" />'+
				'<param name="loop" value="false" />'+
				'<param name="allowFullScreen" value="true" />'+
				'</object>';
		}else{
			s ='<embed src="'+this.portalBaseUrl+'/swf/'+type+'-1.0-SNAPSHOT.swf" quality="high" bgcolor="#FFFFFF"'+
					' width="'+this.flashWidth +'px" height="'+this.flashHeight +'px" id="'+type+'-1.0-SNAPSHOT'+ccsid+'" name="'+type+'-1.0-SNAPSHOT'+ccsid+'" align="middle"'+
					' play="true"'+
					' loop="false"'+
					' flashVars="baseurl='+ url+'&play='+play+'&embedurl='+window.location.href+'&collapse='+this.collapse+'"'+
					' quality="high"'+
					' allowfullscreen="true"'+
					' wmode="transparent"' +
					' allowScriptAccess="always"'+
					' type="application/x-shockwave-flash"'+
					' pluginspage="http://www.adobe.com/go/getflashplayer" />';
		}
	return s;
};

DmsEmbedLib.prototype.recordPlay = function (segmentId) {
 if (this.played == null) {
    this.played = {};
  }
  if (this.played[segmentId] == null) {
    var playerDom = document.getElementById('Player'+segmentId);
//	this.metricsUrl =this.setMetricsUrl();
	this.setUid();
    if (playerDom != null && playerDom.parentNode != null && this.metricsUrl != null) {
        var referrer = 'unknown embed url';
        if (window.location != null && window.location.href != null) {
          referrer = window.location.href;
        }
        var imgSrc = this.metricsUrl + '?' + "clickLocation=embed&action=play&contentType=video&contentID=" + escape(segmentId) + "&userID=" + this.uid + "&referrer=" + escape(referrer) + "&random=" + new Date().getTime();
		var imgObj = document.createElement('img');
        imgObj.src = imgSrc;
        imgObj.height = 1;
        imgObj.width = 1;
        playerDom.parentNode.insertBefore(imgObj, playerDom);
        this.played[segmentId] = true;
    }
  }
};

//this.portalBaseUrl = 'http://app6.cisco.com/portal1/dms/video_portal/';
DmsEmbedLib.prototype.setMetricsUrl = function () {
	var _reportMetricsURL = this.portalBaseUrl+"/clickImage.jsp";
	return _reportMetricsURL;
};

//generates a partial guid
DmsEmbedLib.prototype.pG = function () {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

DmsEmbedLib.prototype.getGuid = function () {
  return (this.pG()+this.pG()+this.pG()+this.pG()+this.pG()+this.pG()+this.pG()+this.pG());
};

DmsEmbedLib.prototype.setUid = function () {
  if (this.uid == null) {
    var uid = this.getUidFromCookie();
    if (uid != null) {
      this.uid = uid;
    }
    else {
      this.uid = this.getGuid();
      this.saveUidToCookie();
    }
  }
};

DmsEmbedLib.prototype.saveUidToCookie = function () {
    var inOneYr = new Date();
    inOneYr.setTime(inOneYr.getTime() + 31536000000);//add 1yr in ms
    var expires = "; expires=" + inOneYr.toGMTString();
    var theDomain = this.getDomain(document.domain);
	  document.cookie = "dmsEmbedUid=" + this.uid + expires + "; path=/; domain=" + theDomain + ";";
};

DmsEmbedLib.prototype.getDomain = function (fullDomain) {
  var findLetter = /[a-z]/i;
  var domain = fullDomain;
  if (findLetter.test(domain)) {
    var domainParts = domain.split('.');
    if (domainParts.length > 2) {
      domain = '.' + domainParts[domainParts.length-2] + '.' + domainParts[domainParts.length-1];
    }
  }
  return domain;
};

DmsEmbedLib.prototype.getUidFromCookie = function () {
    var parts = document.cookie.split(';');
    for (var i=0;i < parts.length;i++) {
      var part = parts[i];
      if (part.indexOf('dmsEmbedUid=') != -1) {
         return part.substring(part.indexOf('=') + 1);
      }
    }
    return null;
};
DmsEmbedLib.prototype.getEventListener = function (ccsid){
 var s=	'<SCRIPT FOR="Player' + ccsid+ '" EVENT="OpenStateChange(NewState)">'+
		'if ( NewState == 13 ) {'+
		'	  setTimeout(function(){endLoading("'+ccsid+'")}, 2);'+
		'  }'+
		'</SCRIPT>'+
		'<SCRIPT FOR="Player' + ccsid+ '" EVENT="buffering(Start)">'+
		'	if (true == Start) {'+
		'	   startBufferProgressThread("'+ccsid+'");'+
		'   } else{'+
		'	   endBufferProgressThread("'+ccsid+'");'+
		'   }'+
		'</SCRIPT>'+
		'<SCRIPT FOR="Player' + ccsid+ '" EVENT="ScriptCommand(scType, param)">'+
		'	sendScriptCommand ( scType, param ,"'+ccsid+'");'+													
		'</SCRIPT>';
		if(this.playerMode == "embed"){
			s +='<SCRIPT FOR="Player' + ccsid+ '" EVENT="PlayStateChange(NewState)">'+
				'	 sendPlayState( Player.playState);'+
				' if (NewState != null && NewState+0 == 3) {\n' +
				'		dmsEmbed.recordPlay("'+ccsid+'");\n' +
				'}\n'+
			'</SCRIPT>';
		}else{
			s +='<SCRIPT FOR="Player' + ccsid+ '" EVENT="PlayStateChange(NewState)">'+
				'	sendPlayState( Player.playState );'+
				'</SCRIPT>';
		}
		
	return s;
};

DmsEmbedLib.prototype.getPreLoader = function(){
return	'<script type="text/javascript" src="'+this.portalBaseUrl +'/scripts/videoplayer/DOM.js"></script>'+' \n ' +
		//'<script type="text/javascript" src="'+this.portalBaseUrl +'/scripts/videoplayer/reporting.js"></script>'+' \n ' +
		'<script type="text/javascript" src="'+ this.portalBaseUrl +'/scripts/videoplayer/windowsmedia.js"></script>'+' \n ' +
		'<script src="'+ this.portalBaseUrl +'/scripts/flex/AC_OETags.js" language="javascript"></script>'+' \n ' +
		'<script type="text/javascript" language="JavaScript">'+' \n ' +
		'<!--'+' \n ' +
		'	javascriptVersion1_1 = true;'+' \n ' +
		'// -->'+' \n ' +
		'</script>'+' \n ' +
		'<script type="text/javascript" language="JavaScript1.1">'+' \n ' +
		'<!--'+' \n ' +
		'// initialize a variable to test for JavaScript 1.1.'+' \n ' +
		'// which is necessary for the window.location.replace method'+' \n ' +
		'var javascriptVersion1_1 = false;'+' \n ' +
		'// -->'+' \n ' +
		'</script>'+' \n ' +
		'<script type="text/javascript" src="'+ this.portalBaseUrl +'/scripts/videoplayer/detectplugins_source.js"></script>'+' \n ';
		
};
//generate a globally available object
var dmsEmbed = new DmsEmbedLib();

