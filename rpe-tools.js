/**
 * rpe-tools.js
 *
 * Data persistence & logging utility for IBM Rational Publishing Engine.
 * To be used in conjunction with RPE Persistence Server.
 *
 * Copyright 2012, ReportableSystems.com
 * http://www.reportablesystems.com
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 **/
var RPETools = (function() {

  /**
   * Minified JSON2 for JS serialization.
   */
  var JSON;if(!JSON){JSON={}}(function(){function f(a){return a<10?"0"+a:a}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];if(i&&typeof i==="object"&&typeof i.toJSON==="function"){i=i.toJSON(a)}if(typeof rep==="function"){i=rep.call(b,a,i)}switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i){return"null"}gap+=indent;h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1){h[c]=str(c,i)||"null"}e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]";gap=g;return e}if(rep&&typeof rep==="object"){f=rep.length;for(c=0;c<f;c+=1){if(typeof rep[c]==="string"){d=rep[c];e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}else{for(d in i){if(Object.prototype.hasOwnProperty.call(i,d)){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}";gap=g;return e}}"use strict";if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","    ":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(a,b,c){var d;gap="";indent="";if(typeof c==="number"){for(d=0;d<c;d+=1){indent+=" "}}else if(typeof c==="string"){indent=c}rep=b;if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":a})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e==="object"){for(c in e){if(Object.prototype.hasOwnProperty.call(e,c)){d=walk(e,c);if(d!==undefined){e[c]=d}else{delete e[c]}}}}return reviver.call(a,b,e)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})();

  /**
   * Default hostname and port configuration settings for communicating with the RPE Persistence Server.
   *
   * @property {String} [serviceHost="localhost"] The hostname where the RPE Persistence Server service is active.
   * @property {String} [servicePort="27465"] The port that the RPE Persistence Server service is bound to.
   * @property {String} [serviceURI="http://localhost:27465/"] The root URI for communicating with the RPE Persistence Server.
   */
  var serviceHost = "localhost";
  var servicePort = 27465;
  var serviceURI = "http://" + serviceHost + ":" + servicePort + "/";

  /**
   * Invokes an HTTP GET request using Rhino Java class wrapping.
   *
   * @param {String} url A well-formed URL.
   * @return {String} The content of the HTTP response.
   */
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

  /**
   * Generates a 36 character UID-like identifier String; e.g. "77a04516-18b4-5be5-12ee-4bb256ebae9e".
   *
   * @return {String} A new UID-like identifier.
   */
  function uid(){
    var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  /**
   * Allocates a file using Rhino Java class wrapping.
   *
   * @param {String} filename A fully-qualified filepath and filename descriptor.
   * @return {java.io.File}
   */
  function getFile(filename){
    var f = new java.io.File(filename);
    if(!f.exists()){
      f.createNewFile();
    }
    return f;
  };

  /**
   * Writes content to a file using Rhino Java class wrapping.
   *
   * @param {String} filename A fully-qualified filepath and filename descriptor.
   * @param {String} content A fully-qualified filepath and filename descriptor.
   * @param {Boolean} [append=false] A flag that adjusts the write mode (append to existing file, or overwrite).
   */
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
   * The Storage module is used to persist variables across multiple RPE templates.
   */
  var Storage = (function() {

    /**
     * Retrieves the value of a variable stored on the RPE Persistence Server.
     *
     * @param {String} name The name of the desired stored variable.
     * @return {String} The value of the stored variable on the RPE Persistence Server.
     */
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

    /**
     * Stores (or overwrites) a variable on the RPE Persistence Server.
     *
     * @param {String} name The name of the variable to store.
     * @param {String} value The value to be assigned to the named variable.
     * @return {String} The original value.
     */
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

    /**
     * Clears all variables and associated values from the RPE Persistence Server.
     *
     * @return {String} Empty string.
     */
    function reset(){
      request = serviceURI + "storage/reset";
      get(request);
      java.lang.System.out.println("RPETools.js: reset Storage.");
      return "";
    };

    /**
     * Saves to disk an XML representation of all variables stored on the RPE Persistence Server.
     *
     * @param {String} filename The target filename for writing XML content.
     * @return {String} An XML representation of all variables stored on the RPE Persistence Server.
     */
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

    /**
     * Return publicly accessible functions for the Storage module.
     */
    return {
      read : read,
      write : write,
      reset : reset,
      saveXML : saveXML
    };
  })();

  /**
   * the Logger module is used to manage publishing logs for non-trivial RPE templates.
   */
  var Logger = (function() {

    /**
     * Records (and optionally tags) a log message to the RPE Persistence Server.
     *
     * @param {String} msg The content of the log message to be stored.
     * @param {String} [tag=""] An optional String that can be used to identify related log messages.
     * @return {String} A 36 character ID generated for the logged message, to use with an RPE Bookmark element.
     */
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

    /**
     * Clears all log entries from the RPE Persistence Server.
     *
     * @return {String} Empty string.
     */
    function reset(){
      request = serviceURI + "logger/reset";
      get(request);
      java.lang.System.out.println("RPETools.js: reset Logger.");
      return "";
    };

    /**
     * Saves to disk an XML representation of all logged messages on the RPE Persistence Server.
     *
     * @param {String} filename The target filename for writing XML content.
     * @return {String} An XML representation of all logged messages on the RPE Persistence Server.
     */
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

    /**
     * Return publicly accessible functions for the Logger module.
     */
    return {
      log : log,
      reset : reset,
      saveXML : saveXML
    };
  })();

  /**
   * Getter to enable public access to the Storage module.
   */
  function getStorage(){
    return Storage;
  };

  /**
   * Getter to enable public access to the Logger module.
   */
  function getLogger(){
    return Logger;
  };

  /**
   * Overrides default hostname and port configuration settings for the RPE Persistence Server.
   *
   * @param {String} serviceHost The target filename for writing XML content.
   * @param {String} servicePort The target filename for writing XML content.
   **/
  function setHost(){
    serviceHost = (arguments[0]) ? arguments[0] : "localhost";
    servicePort = (arguments[1]) ? arguments[1] : "27465";
    serviceURI = "http://" + serviceHost + ":" + servicePort + "/";
  }

  /**
   * Return functions for accessing the Storage and Logger modules, and to override the default hostname and port configuration settings for the RPE Persistence Server.
   */
  return{
    getStorage : getStorage,
    getLogger : getLogger,
    setHost : setHost
  };
})();