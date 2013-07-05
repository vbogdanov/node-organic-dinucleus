var uuid = require("node-uuid");
var util = require("util");
var synapse = require("organic-synapse");

module.exports = function DINucleus(plasma, dna){
  this.plasma = plasma;
  this.dna = dna;
  
  var self = this;
  this.organellesMap = Object.create(null);
  this.definitionMap = Object.create(null);
  
  self.buildOne = function(c, callback){
    if (typeof c !== "string")
      throw "IllegalArgumentException: " + typeof c;
    var result = self.resolveFactoryByName(c)();
    callback && callback(result);
    return result;
  }
  
  self.build = function(c, callback){
    callback = callback || function () {};
    if (typeof c === "string")
      return self.buildOne(c, callback);
    else {
      var result = [];
      for (var key in self.dna) {
        if (typeof self.dna[key] !== "function") {
          var factory = self.resolveFactoryByName(key);
          if (factory.singleton) {
            callback(factory());
            result.push(factory());
          }
        }
      }
      return result;
    }
  }
    
  plasma.on(synapse.address.EVENT, function (chemical, callback) {
    var address = chemical.address || "1";
    if (typeof address !== "string" || address === "__proto__" /* add other safe conditions here or handle the organellesMap better */)
      return false;
    var organel = this.organellesMap[chemical.address];
    if (organel) {
      callback(synapse.Transport.createInProcess(organel.instance));
      return true;
    }
    return false;
  }.bind(this));
}

module.exports.prototype = {
  resolveFactoryByName: function (id) {
    var cached = this.definitionMap[id];
    if (typeof cached === "undefined") {
      cached = this.resolveFactory(this.dna[id]);
      this.definitionMap[id] = cached;
    }
    return cached;
  }
  , resolveFactory: function (json) {
    var entries = module.exports.entries;
    var type = json._ || "poso";
    return entries[type].call(this, json);
  }
  , resolveInjected: function (ijson) {
    var result = {};
    for (var key in ijson) {
      result[key] = this.resolveFactory(ijson[key])().address;
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
      var injected = this.resolveInjected(json.inject);
      console.log(config, injected);
      for (var k in injected) {
        config[k] = injected[k];
      }
    }
    return config;
  }
  , register: function (instance) {
    instance.address = uuid.v1();
    this.organellesMap[instance.address] = { "instance": instance };
    return instance;
  }
}

/*
 * This object (DINucleus.entries) describes all possible entity types ('_' values)
 * each entity is described by a function that
 * 1. is invoked in the context of a DINucleus instance
 * 2. is passed the json describing the entity as its only parameter
 * 3. returning a factory function that:
 *      3.1 accepts no parameters
 *      3.2 has a property 'singleton' that equals true if multiple invocations result in the same instance
 * 
 */
module.exports.entries = {
  "poso": function (json) {
    var OrganelClass = this.getPlainOldOrganel(json);
    var instance = new OrganelClass(this.plasma, this.getConfig(json));
    instance = this.register(instance);
    
    var result = function () {
      return instance;
    }
    result.singleton = true;
    
    return result;
  }
  , "popo": function (json) {
    var OrganelClass = this.getPlainOldOrganel(json);
    var self = this;
    var result = function () {
      return self.register(new OrganelClass(self.plasma, self.getConfig(json)));
    }
    result.singleton = false;
    
    return result;
  }
  , "mapFinal": function (json) {
    var map = this.register(Object.freeze(json));
    var result = function () {
      return map;
    }
    result.singleton = true;
    return result;
  }
  , "ref": function (json) {
    return this.resolveFactoryByName(json.ref)
  }
}