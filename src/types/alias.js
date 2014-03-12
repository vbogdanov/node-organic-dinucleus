if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([], function () {

  function createAliasFactory(options, done) {
    //t({'bean': beanDesc, 'context': self }, done);
    var
    descr = options.bean,
    context = options.context,
    id = descr.id;

    if (typeof id !== 'string') {
      return done(new Error('value property must be string'));
    }

    done(false, function (environment, d) {
      environment.get(id, d);
    });
  }

  return createAliasFactory;
});