if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
['reactions', 'requirejs', 'safemap', 'src/context', 'src/types/const', 'src/types/instance',
 'src/types/module', 'src/types/alias', 'src/types/exec'], 
function (R, requirejs, SafeMap, Context, Const, Instance, Module, Alias, Exec) {
  var exports;

  function configureLoaders(config, done) {
    var loaderNames =  config.loaders || ['simpleamdloader'];
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
      '#':['alias','id'],
      '=':['const', 'value']
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
    createBeanFactory = function (beanDescr, done) {
      context.createBeanFactory(beanDescr, R.fastdone(done, function (factory) {
        factory.scope = beanDescr.scope;
        done(false, factory);
      }));
    };

    R.fn.mapHash(createBeanFactory, contextConfig, done);
  }

  function buildEnvironment(factories, done) {
    var SCOPES = {
      'singleton': new SafeMap(),
      'prototype': new NoMap()
    };

    var environment = {
      'get': function (id, done) {
        var factory = factories[id];
        
        if (typeof factory !== 'function') {
          return done(new Error('no such bean described:' + id));
        }
        
        var scope = factory.scope || 'singleton';
        
        if (SCOPES[scope].has(id)) {
          return SCOPES[scope].get(id);
        } else {
          factory(environment, R.fastdone(done, function (val) {
            SCOPES[scope].set(id, val);
            done(false, val);
          }));
        }
      }
    };

    done(false, environment);
  };

  exports = function (config, done) {
    //self configuration
    /*
    {
      defaultType: 'instance',                              //defaults to 'instance'
      loaders: ['array','of','loader','modules'],           //defaults to ['simpleAMDLoader']
      types: { 'eval': function (beanDescr, done) {...} },  //extender types
      shorthands: { '$':['eval','expr'] },                  //extender shorthands
      context: {
        //bean description by id
        simple: {
          src: 'example/simple'
        }
      }
    }
    */
    var evalConfig = R.make.collectParallel([
      R.echo,
      configureLoaders,
      configureTypes,
      configureShorthands
    ]);

    R.fn.waterfall([evalConfig, buildFactories, buildEnvironment], config, done);
  };

  function NoMap() {
    this.has = function (str) {
      return false;
    }
    this.set = function (arg) {
      //ignore
    }
  }

  return exports;
});