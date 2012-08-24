/**
 * rpe-tools.js
 * ------------
 * Data persistence & logging utility for IBM Rational Publishing Engine.
 * For use in conjunction with RPETools Persistence Server.
 *
 * Copyright 2012, ReportableSystems.com
 * http://www.reportablesystems.com
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 **/
var RPETools = (function() {

  /**
   * private vars & helper functions
   */
  var JSON;if(!JSON){JSON={}}(function(){function f(a){return a<10?"0"+a:a}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];if(i&&typeof i==="object"&&typeof i.toJSON==="function"){i=i.toJSON(a)}if(typeof rep==="function"){i=rep.call(b,a,i)}switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i){return"null"}gap+=indent;h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1){h[c]=str(c,i)||"null"}e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]";gap=g;return e}if(rep&&typeof rep==="object"){f=rep.length;for(c=0;c<f;c+=1){if(typeof rep[c]==="string"){d=rep[c];e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}else{for(d in i){if(Object.prototype.hasOwnProperty.call(i,d)){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}";gap=g;return e}}"use strict";if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","    ":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(a,b,c){var d;gap="";indent="";if(typeof c==="number"){for(d=0;d<c;d+=1){indent+=" "}}else if(typeof c==="string"){indent=c}rep=b;if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":a})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e==="object"){for(c in e){if(Object.prototype.hasOwnProperty.call(e,c)){d=walk(e,c);if(d!==undefined){e[c]=d}else{delete e[c]}}}}return reviver.call(a,b,e)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})();
  var servicePort = 27465;
  var serviceHost = "localhost";
  var serviceURI = "http://" + serviceHost + ":" + servicePort + "/";

  // JS+Rhino Java utility function for HTTP GET...
  function get(url){
    buf = "", line = "";
    try{
      var bis = new java.io.BufferedReader(new java.io.InputStreamReader(new java.net.URL(url).openConnection().getInputStream()));
      while((line=bis.readLine())!=null){
        buf+=line;
      }
      bis.close();
    }catch(error){
      java.lang.System.out.println("RPETools.js Exception: " + error);
    };
    return buf;
  };

  // generated a UID-like ID
  function uid(){
    var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  // JS+Rhino Java utility function for file allocation...
  function getFile(filename){
    var f = new java.io.File(filename);
    if(!f.exists()){
      f.createNewFile();
    }
    return f;
  };

  // JS+Rhino Java utility function for file writing...
  function writeToFile(){
    var filename = (arguments[0]) ? arguments[0] : "";
    var content = (arguments[1]) ? arguments[1] : "";
    var append = (arguments[2]) ? arguments[2] : false;
    var f = getFile(filename);
    var fstream = new java.io.FileWriter(f,append);
    var out = new java.io.BufferedWriter(fstream);
    out.write(content);
    out.close();
  };

  /**
   * the Storage namespace is used to persist variables across multiple RPE templates
   */
  var Storage = (function() {
    function read(){
      var name = (arguments[0]) ? arguments[0] : "";
      var result = "";
      if(name!=""){
        request = serviceURI + "storage/read?name=" + encodeURIComponent(name);
        try{
          result = JSON.parse(decodeURIComponent(get(request)));
          java.lang.System.out.println("RPETools.js: read variable '" + name + "' from Storage.");
        }catch(error){
          java.lang.System.out.println("RPETools.js Exception: Requested variable not found on server, or is corrupted. Empty string returned.");
        };
      }else{
        throw new Error("RPETools.js Exception: RPETools.Storage.read(): First argument (name) was missing.");
      };
      return result;
    };
    function write(){
      var name = (arguments[0]) ? arguments[0] : "";
      var value = (arguments[1]) ? arguments[1] : "";
      var result = "";
      if(name!=""){
        request = serviceURI + "storage/write?name=" + encodeURIComponent(name) + "&value=" + encodeURIComponent(JSON.stringify(value));
        get(request);
        java.lang.System.out.println("RPETools.js: write variable '" + name + "' to Storage.");
        result = value; // for expediency, simply return the value param
      }else{
        throw new Error("RPETools.js Exception: RPETools.Storage.write(): First argument (name) was missing.");
      };
      return result;
    };
    function reset(){
      request = serviceURI + "storage/reset";
      get(request);
      java.lang.System.out.println("RPETools.js: reset Storage.");
      return "";
    };
    function saveXML(){
      var filename = (arguments[0]) ? arguments[0] : "";
      request = serviceURI + "storage/view";
      var result = "";
      result = get(request);
      try{
        writeToFile(filename,result);
        java.lang.System.out.println("RPETools.js: write Storage XML to file '" + filename + "'.");
      }catch(error){
        java.lang.System.out.println("RPETools.js Exception: " + error);
      };
      return result;
    };
    return {
      read : read,
      write : write,
      reset : reset,
      saveXML : saveXML
    };
  })();

  /**
   * the Logger namespace is used to store, and optionally tag publishing log messages and generate bookmark IDs for inline hyperlinking
   */
  var Logger = (function() {
    function log(){
      var msg = (arguments[0]) ? arguments[0] : "";
      var tag = (arguments[1]) ? arguments[1] : "";
      var result = "";
      if(msg!=""){
        request = serviceURI + "logger/log?uid=" + uid() + "&msg=" + encodeURIComponent(msg);
        if(tag!=""){
          request += "&tag=" + encodeURIComponent(tag);
        };
        result = decodeURIComponent(get(request));
        java.lang.System.out.println("RPETools.js: log message with ID '" + result + "' saved to Logger.");
      }else{
        throw new Error("RPETools.js Exception: RPETools.Logger.log(): First argument (message) was missing.");
      };
      return result;
    };
    function reset(){
      request = serviceURI + "logger/reset";
      get(request);
      java.lang.System.out.println("RPETools.js: reset Logger.");
      return "";
    };
    function saveXML(){
      var filename = (arguments[0]) ? arguments[0] : "";
      request = serviceURI + "logger/view";
      var result = "";
      result = get(request);
      try{
        writeToFile(filename,result);
        java.lang.System.out.println("RPETools.js: write Logger XML to file '" + filename + "'.");
      }catch(error){
        java.lang.System.out.println("RPETools.js Exception: " + error);
      };
      return result;
    };
    return {
      log : log,
      reset : reset,
      saveXML : saveXML
    };
  })();

  /**
   * public functions
   */
  function getStorage(){
    return Storage;
  };
  function getLogger(){
    return Logger;
  };
  function setHost(){
    serviceHost = (arguments[0]) ? arguments[0] : "localhost";
    servicePort = (arguments[1]) ? arguments[1] : "27465";
    serviceURI = "http://" + serviceHost + ":" + servicePort + "/";
  }

  return{
    getStorage : getStorage,
    getLogger : getLogger,
    setHost : setHost
  };
})();