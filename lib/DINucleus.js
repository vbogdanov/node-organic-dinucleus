'use strict';
var util = require('util');

module.exports = function (plasma, dna){
  this.plasma = plasma;
  this.dna = dna;
  
  var self = this;
  this.organellesMap = Object.create(null);
  this.definitionMap = Object.create(null);
  
  self.buildOne = function(c, callback){
    if (typeof c !== 'string')
      throw 'IllegalArgumentException: ' + typeof c;
    var result = self.resolveFactoryByName(c)();
    if(callback) callback(result);
    return result;
  };
  
  self.build = function(c, callback){
    callback = callback || function () {};
    if (typeof c === 'string')
      return self.buildOne(c, callback);
    else {
      var result = [];
      for (var key in self.dna) {
        self.buildOnlySingletons(key, result, callback);
      }
      return result;
    }
  };

  self.buildOnlySingletons = function (key, result, callback) {
    if (typeof self.dna[key] === 'function') return;
    var factory = self.resolveFactoryByName(key);
    if (factory.singleton) {
      callback(factory());
      result.push(factory());
    }
  };
};


module.exports.prototype = {
  resolveFactoryByName: function (id) {
    var cached = this.definitionMap[id];
    if (typeof cached === 'undefined') {
      cached = this.resolveFactory(this.dna[id]);
      this.definitionMap[id] = cached;
    }
    return cached;
  },
  resolveFactory: function (json) {
    var entries = this.entries;
    if (typeof json === 'string') {
      json = this.resolveShorthand(json);
    }
    var type = json._ || 'poso';
    return entries[type].call(this, json);
  },
  resolveShorthand: function (text) {
    var shorthand = this.shorthand[text.charAt(0)];
    if (typeof shorthand !== 'function') {
      throw 'illegal string passed as entity';
    }
    return shorthand(text.substr(1));
  },
  resolveInjected: function (ijson) {
    var result = {};
    for (var key in ijson) {
      result[key] = this.resolveFactory(ijson[key])();
    }
    return result;
  },
  loadByName: function (source) {
    if(source.indexOf('.') && source.indexOf('/') === -1 && source.indexOf('\\') === -1)
      source = source.split('.').join('/');
    if(source.indexOf('/') !== 0 && source.indexOf(':\\') !== 1)
      source = process.cwd()+'/'+source;
    return require(source);
  },
  getPlainOldOrganel: function (json) {
    if(!json.source)
      throw new Error('can not create object without source but with '+util.inspect(json));
    
    var OrganelClass = null;
    
    if(typeof json.source == 'function') {
      OrganelClass = json.source;
    } else if (typeof json.source == 'string'){
      OrganelClass = this.loadByName(json.source);
    } else {
      throw 'Unsupported type of source: ' + typeof json.source;
    }
    return OrganelClass;
  },
  getConfig: function (json) {
    var config = Object.create(json.config || null);
    if (json.inject) {
      var injected = this.resolveInjected(json.inject);
      for (var k in injected) {
        config[k] = injected[k];
      }
    }
    return config;
  },
  register: function (instance) {
    //TODO: be overriden in extensions
    return instance;
  }
};

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
module.exports.prototype.entries = {
  'poso': function (json) {
    var OrganelClass = this.getPlainOldOrganel(json);
    var instance = new OrganelClass(this.plasma, this.getConfig(json));
    instance = this.register(instance);
    
    var result = function () {
      return instance;
    };
    result.singleton = true;
    
    return result;
  },
  'popo': function (json) {
    var OrganelClass = this.getPlainOldOrganel(json);
    var self = this;
    var result = function () {
      return self.register(new OrganelClass(self.plasma, self.getConfig(json)));
    };
    result.singleton = false;
    
    return result;
  },
  'mapFinal': function (json) {
    var map = Object.freeze(this.register(json));
    var result = function () {
      return map;
    };
    result.singleton = true;
    return result;
  },
  'ref': function (json) {
    return this.resolveFactoryByName(json.ref);
  }
};

/**
 * Shorthands for entries. instead of object with entry a string is given. The first symbol chooses the shorthand, the rest is a parameter.
 * In the shorthand object the key is the first symbol and the value is a function passed the rest of the string and returning proper entry object
 */
module.exports.prototype.shorthand = {
  '#': function (str) {
    return { _: 'ref', ref: str };
  },
  '!': function (str) {
    return { _: 'popo', source: str };
  }
};