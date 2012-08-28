/**
 * @module RPE
 **/

/**
 * Data persistence & logging utility for IBM Rational® Publishing Engine™.
 * Use in conjunction with RPE Persistence Server from Reportable Systems.
 *
 * Copyright 2012, ReportableSystems.com
 * http://www.reportablesystems.com
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 * @class RPETools
 * @static
 **/
var RPETools = (function() {

  /**
   * A minified version of Douglas Crockford's JSON library, for JS serialization.
   * See https://github.com/douglascrockford/JSON-js/blob/master/json2.js
   *
   * @property JSON
   * @type Object
   */
  var JSON;if(!JSON){JSON={}}(function(){function f(a){return a<10?"0"+a:a}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];if(i&&typeof i==="object"&&typeof i.toJSON==="function"){i=i.toJSON(a)}if(typeof rep==="function"){i=rep.call(b,a,i)}switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i){return"null"}gap+=indent;h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1){h[c]=str(c,i)||"null"}e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]";gap=g;return e}if(rep&&typeof rep==="object"){f=rep.length;for(c=0;c<f;c+=1){if(typeof rep[c]==="string"){d=rep[c];e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}else{for(d in i){if(Object.prototype.hasOwnProperty.call(i,d)){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}";gap=g;return e}}"use strict";if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","    ":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(a,b,c){var d;gap="";indent="";if(typeof c==="number"){for(d=0;d<c;d+=1){indent+=" "}}else if(typeof c==="string"){indent=c}rep=b;if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":a})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e==="object"){for(c in e){if(Object.prototype.hasOwnProperty.call(e,c)){d=walk(e,c);if(d!==undefined){e[c]=d}else{delete e[c]}}}}return reviver.call(a,b,e)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})();

  /**
   * The hostname or IP address of the RPE Persistence Server.
   *
   * @property host
   * @type String
   * @default "localhost"
   */
  var host = "localhost";

  /**
   * The port number of the RPE Persistence Server.
   *
   * @property port
   * @type Number
   * @default 27465
   */
  var port = 27465;
  /**
   * The base URI for communicating with the RPE Persistence Server service.
   *
   * @property serviceURI
   * @type String
   * @default "http://localhost:27465/"
   */
  var serviceURI = "http://" + host + ":" + port + "/";

  /**
   * Invokes an HTTP GET request using Mozilla Rhino / Java class wrapping.
   *
   * @method get
   * @private
   * @param url {String} A well-formed, validly encoded URL.
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
   * @method uid
   * @private
   * @return {String} A new UID-like identifier.
   */
  function uid(){
    var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  /**
   * Allocates a file using Mozilla Rhino / Java class wrapping.
   *
   * @method getFile
   * @private
   * @param filename {String} A fully-qualified filepath and filename descriptor.
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
   * Writes content to a file using Mozilla Rhino / Java class wrapping.
   *
   * @method writeToFile
   * @private
   * @param filename {String} A fully-qualified filepath and filename descriptor.
   * @param content {String} A fully-qualified filepath and filename descriptor.
   * @param [append=false] {Boolean} A flag that adjusts the write mode (append to existing file, or overwrite).
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
   * Overrides default hostname and port configuration settings for the RPE Persistence Server.
   *
   * @method setHost
   * @param host {String} The IP address or hostname where the RPE Persistence Server service is running.
   * @param port {Number} The port number that the RPE Persistence Server service is bound to.
   * @example
       RPETools.setHost("10.0.2.5",27465);
   **/
  function setHost(){
    host = (arguments[0]) ? arguments[0] : "localhost";
    port = (arguments[1]) ? arguments[1] : 27465;
    serviceURI = "http://" + host + ":" + port + "/";
  }

  /**
   * The Storage module is used to persist variables across multiple RPE templates.
   *
   * @class Storage
   * @static
   */
  var Storage = (function() {

    /**
     * Retrieves then de-serializes the content of the named variable from the RPE Persistence Server.
     *
     * @method read
     * @param name {String} The name of the desired stored variable.
     * @return {Boolean|Number|String|Array|Object} The value of the stored variable on the RPE Persistence Server.
     * @example
        // retrieve value of myVariable from RPE Persistence Server...
        var myVariable = RPETools.Storage.read("myVariable");
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
     * Serializes then stores a variable on the RPE Persistence Server; overwrites if the named variable already exists.
     *
     * @method write
     * @param name {String} The name of the variable to store.
     * @param value {Boolean|Number|String|Array|Object} The value to be assigned to the named variable.
     * @return {Boolean|Number|String|Array|Object} The original value.
     * @example
        // store some simple JS vars...
        RPETools.Storage.write("myBooleanVariable",true);
        RPETools.Storage.write("myNumericVariable",256);
        RPETools.Storage.write("myStringVariable","Some string.");

        // store an array & simple JS object...
        RPETools.Storage.write("myArrayVariable",["Audi","BMW","Jaguar"]);
        RPETools.Storage.write("myLiteralVariable",{"host":"localhost","port":"27465"});

        // store a more complex JS object...
        var myObjectVariable = {
          name: "Test Object",
          someArrayNumbers: [1,2,3],
          aFlag : true,
          aNestedObject : {
            name : "Test Object's Nested Object"
          }
        };
        RPETools.Storage().write("anObjectVariable",myObjectVariable);
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
     * Clears all variables from the RPE Persistence Server.
     *
     * @method reset
     * @return {String} An empty string.
     * @example
        RPETools.Storage.reset();
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
     * @method saveXML
     * @param filename {String} The target filename to which XML content is written.
     * @return {String} An XML representation of all variables stored on the RPE Persistence Server.
     * @example
        RPETools.Storage.saveXML("c:\\temp\\storage.xml");
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

    // Return publicly accessible functions for the Storage module.
    return {
      read : read,
      write : write,
      reset : reset,
      saveXML : saveXML
    };
  })();

  /**
   * The Logger module is used to manage publishing logs for non-trivial RPE templates.
   *
   * @class Logger
   * @static
   */
  var Logger = (function() {

    /**
     * Records (and optionally tags) a log message to the RPE Persistence Server.
     *
     * @method log
     * @param msg {String} The content of the log message to be stored.
     * @param [tag=""] {String} An optional String that can be used to identify related log messages.
     * @return {String} A 36 character ID generated for the logged message, to use with an RPE Bookmark element.
     * @example
        // record a simple log message
        var bookmark = RPETools.Logger.log("The requested Rhapsody package could not be found.");

        // record a log message tagged "DOORS"
        var bookmark = RPETools.Logger.log("Expected DOORS module attribute not found.","DOORS");
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
     * @method reset
     * @return {String} Empty string.
     * @example
        RPETools.Logger.reset();
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
     * @method saveXML
     * @param filename {String} The target filename to which XML content is written.
     * @return {String} An XML representation of all logged messages on the RPE Persistence Server.
     * @example
        RPETools.Logger.saveXML("c:\\temp\\logger.xml");
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

    // Return publicly accessible functions for the Logger module.
    return {
      log : log,
      reset : reset,
      saveXML : saveXML
    };
  })();

  // Return access functions for the Storage and Logger classes, and to the setHost() function for overriding the default hostname and port configuration settings for the RPE Persistence Server.
  return{
    Storage : Storage,
    Logger : Logger,
    setHost : setHost
  };
})();