if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['requirejs'], function (requirejs) {

  function loadModule(options, done) {
    //t({'bean': beanDesc, 'context': self }, done);
    var
    descr = options.bean,
    context = options.context,
    name = descr.name;

    if (typeof id !== 'string') {
      return done(new Error('name property must be string'));
    }

    done(false, function (environment, d) {
      requirejs([name], function (mod) {
        done(false, mod);
      });
    });
  }

  return loadModule;
});