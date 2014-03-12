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

  function createExecFactory(options, done) {
    //t({'bean': beanDesc, 'context': self }, done);
    var
    descr = options.bean,
    context = options.context,
    args = descr.args,
    makeParamFactories = R.make.map(context.createBeanFactory),
    prepFactory = function (factoriesArray, done) {
      resolveClass(descr.src, context, R.done(done, function (func) {
        done(false, makeFactory(func, factoriesArray));
      }));
    };

    R.fn.waterfall([makeParamFactories, prepFactory], args || [], done);
  }

  function makeFactory (func, factoriesArray) {
    return function (environment, done) {
      var calcParams = R.make.map(function (factory, d) {
        factory(environment, d);
      });

      var createInstance = function (args, done) {
        done(false, func.apply(null, args));
      };

      R.fn.waterfall([calcParams, createInstance], factoriesArray, done);
    };
  }

  return createExecFactory;
});