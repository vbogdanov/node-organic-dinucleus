if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['reactions'], function (R) {
  'use strict';
 
  function Context(defaultType, loadReaction, types, shorthands) {
    var self = this;

    self.createBeanFactory = function(beanDesc, done) {
      if (typeof beanDesc === 'string') {
        beanDesc = self.createBeanDesc(beanDesc);
      }
      if (!beanDesc) {
        return done(new Error('bean description is required'));
      }
      getType(beanDesc, R.done(done, function (t) {
        t({'bean': beanDesc, 'context': self }, done);
      }));      
    };

    self.createBeanDesc = function (shorthand) {
      var sh = shorthands[shorthand.charAt(0)];
      if (!sh) {
        //no shorthand found, caller will stop execution when null is returned
        return null;
      }
      var beanDesc = {};
      beanDesc.type = sh[0];
      beanDesc[sh[1]] = shorthand.substr(1);
      return beanDesc;
    }

    self.loadByName = function (fqn, done) {
      loadReaction(fqn, done);
    }

    function getType(beanDesc, done) {
      var t = types[beanDesc.type || defaultType];
      if (!t || typeof t !== 'function') {
        done(new Error('unknown beanDesc type:[' + beanDesc.type + ']'));
      } else {
        done(false, t);
      }
    }

  };

  return Context;
});