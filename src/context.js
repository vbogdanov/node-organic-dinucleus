if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['reactions'], function (R) {
  'use strict';
 
  function Context(defaultType, loadReaction, types, shorthands) {
    var self = this;

    self.createBeanFactory = function(beanDesc, done) {
      getType(beanDesc, R.done(done, function (t) {
        t({'bean': beanDesc, 'context': self }, done);
      }));      
    };

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