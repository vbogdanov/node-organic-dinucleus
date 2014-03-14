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

    if (typeof name !== 'string') {
      return done(new Error('name property must be string'));
    }

    done(false, function (environment, d) {
      requirejs([name], function (mod) {
        d(false, mod);
      });
    });
  }

  return loadModule;
});