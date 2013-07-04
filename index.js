var uuid = require("node-uuid");
var util = require("util");
var synapse = require("organic-synapse");
var organic = require("organic");

module.exports = function Nucleus(plasma, dna){
  this.plasma = plasma;
  this.dna = dna instanceof DNA?dna:new DNA(dna);
  
  var self = this;
  var organellesMap = Object.create(null);
  this.definitionMap = Object.create(null);
  
  self.buildOne = function(c, callback){
    //TODO:
  }
  
  self.build = function(c, callback){
    //TODO:
  }
    
  plasma.on(Address.EVENT, function (chemical, callback) {
    var address = chemical.address || "1";
    if (typeof address !== "string" || address === "__proto__" /* add other safe conditions here or handle the organellesMap better */)
      return false;
    var organel = this.organellesMap[chemical.address];
    if (organel) {
      callback(transport.createInProcess(organel.instance));
      return true;
    }
    return false;
  }.bind(this));
}

module.exports.prototype = {
  resolveFactory: function (json) {
    var entries = module.exports.entries;
    var type = json._ || "poso";
    return entries[type].call(this, json);
  }
  , resolveInjected: function (ijson) {
    var result = {}
    for (var key in ijson) {
      result[key] = this.resolveFactory(ijson[key])();
    }
    return result;
  }
  , loadByName: function (source) {
    if(source.indexOf(".") && source.indexOf("/") === -1 && source.indexOf("\\") === -1)
      source = source.split(".").join("/");
    if(source.indexOf("/") !== 0 && source.indexOf(":\\") !== 1)
      source = process.cwd()+"/"+source;
    return require(source);
  }
  , getPlainOldOrganel: function (json) {
    if(!json.source)
      throw new Error("can not create object without source but with "+util.inspect(c));
    
    var OrganelClass = null;
    
    if(typeof json.source == "function") {
      OrganelClass = json.source;
    } else if (typeof json.source == "string"){
      OrganelClass = this.loadByName(json.source);
    } else {
      throw "Unsupported type of source: " + typeof json.source
    }
    return OrganelClass;
  }
  , getConfig: function (json) {
    var config = Object.create(json.config || null);
    if (json.inject) {
      util.inherits(config, this.resolveInjected(json.inject));
    }
    return config;
  }
}

module.exports.entries = {
  "poso": function (json) {
    var OrganelClass = this.getPlainOldOrganel(json);
    var instance = new OrganelClass(this.plasma, getConfig(plasma, json));
    
    var result = function () {
      return instance;
    }
    result.singleton = true;
    
    return result;
  }
  , "popo": function (json) {
    var OrganelClass = this.getPlainOldOrganel(json);
   
    var result = function () {
      return new OrganelClass(this.plasma, getConfig(plasma, json));;
    }
    result.singleton = false;
    
    return result;
  }
  , "mapFinal": function (json) {
    var map = Object.freeze(json);
    var result = function () {
      return map;
    }
    result.singleton = true;
    return result;
  }
  , "ref": function (json) {
    var id = json.ref;
    var cached = this.definitionMap[id];
    if (typeof cached === "undefined") {
      cached = this.resolveFactory(this.dna[id]);
      this.definitionMap[id] = cached;
    }
    return cached;
  }
}