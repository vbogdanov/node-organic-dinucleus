if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([], function () {

  function createConstantFactory(options, done) {
    //t({'bean': beanDesc, 'context': self }, done);
    var
    descr = options.bean,
    context = options.context,
    value = descr.value;

    if (typeof value === 'undefined') {
      return done(new Error('value property is needed for constants'));
    }

    done(false, function (environment, d) {
      d(false, value);
    });
  }

  return createConstantFactory;
});