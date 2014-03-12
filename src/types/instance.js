if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['reactions'], function (R) {

  function resolveClass(srcValue, context, done) {
    if (typeof srcValue === 'function') {
      done(false, srcValue);
    } else {
      context.loadByName(srcValue, done);
    }
  }

  function createInstanceFactory(options, done) {
    //t({'bean': beanDesc, 'context': self }, done);
    var
    descr = options.bean,
    context = options.context,
    makeParamFactories = R.make.mapHash(context.createBeanFactory),
    prepFactory = function (factoriesHash, done) {
      resolveClass(descr.src, context, R.done(done, function (clazz) {
        done(false, makeFactory(clazz, factoriesHash));
      }));
    };
    //console.log(descr.params);
    R.fn.waterfall([makeParamFactories, prepFactory], descr.params || {}, done);
  }

  function makeFactory (clazz, factoriesHash) {
    return function (environment, done) {
      var calcParams = R.make.mapHash(function (factory, d) {
        factory(environment, d);
      });

      var createInstance = function (params, done) {
        done(false, new clazz(params));
      };

      R.fn.waterfall([calcParams, createInstance], factoriesHash, done);
    };
  }

  return createInstanceFactory;
});