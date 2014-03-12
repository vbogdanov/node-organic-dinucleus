if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
['reactions', 'requirejs', 'src/context', 'src/types/const', 'src/types/instance', 'src/types/module', 'src/types/alias', 'src/types/exec'], 
function (R, requirejs, Context, Const, Instance, Module, Alias, Exec) {
  var exports;

  function configureLoaders(config, done) {
    var loaderNames =  config.loaders || ['simpleAMDLoader'];
    requirejs(loaderNames, function () {
      var loaders = Array.prototype.slice.call(arguments, 0);
      done(false, R.make.first(loaders));
    });
  }

  function configureTypes(config, done) {
    var types = {
      'const': Const,
      'instance': Instance,
      'module': Module,
      'alias': Alias,
      'exec': Exec
    };
    var extTypes = config.types || {};
    for (var k in extTypes) {
      types[k] = extTypes[k];
    }
    done(false, types);
  }

  function configureShorthands(config, done) {
    var shorthands = {
      '#':['alias','id']
    };
    var extShorts = config.shorthands;
    for (var k in extShorts) {
      shorthands[k] = extShorts[k];
    }
    done(false, shorthands);
  }

  function buildFactories(arg, done) {
    var 
    defaulttype = arg[0].defaultType || 'instance',
    context = new Context(defaulttype, arg[1], arg[2], arg[3]),
    contextConfig = arg[0].context,
    id,
    factory,
    factories = {},
    beanDesc;

    //TODO: parallel
    for (id in contextConfig) {
      beanDesc = contextConfig[id];
      context.createBeanFactory(beanDesc, function (err, factory) {
        factory.id = id;
        factory.scope = beanDesc.scope || 'singleton';
        factories[id] = factory;
      });
    }

    done(false, factories);
  }

  exports = function (config, done) {
    //self configuration
    R.fn.collectParallel([
        R.echo,
        configureLoaders,
        configureTypes,
        configureShorthands
      ], 
      config, 
      R.fastdone(done, function (args) {
        buildFactories(args, done);
      })
    );

  };

  return exports;
});