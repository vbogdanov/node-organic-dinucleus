/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var 
  instanceFF = require('../src/types/instance'),
  Context = require('../src/context'),
  loader = function (name, done) {
    var clazz = require(name);
    done(false, clazz);
  },
  context = new Context('instance', loader, { 'instance': instanceFF }, {});


describe('Instance', function () {
  
  it('FactoryFactory is a function', function () {
    expect(instanceFF).toEqual(jasmine.any(Function));
  });

  it('returns a Factory when passed bean description and context', function (next) {
    var beanDescr = {
      type: 'instance',
      src: function () {}
    };

    instanceFF({ 'bean': beanDescr, 'context': context } , function(err, factory) {
      expect(err).toBeFalsy();
      expect(factory).toEqual(jasmine.any(Function));
      next();
    });
  });

  it('creates an instance when passed environment', function (next) {
    var 
      MyClass = function () {},
      beanDescr = {
        type: 'instance',
        src: MyClass
      };

    instanceFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();

      factory({}, function (err, instance) {
        expect(instance).toEqual(jasmine.any(MyClass));
        expect(err).toBeFalsy();
        next();
      });
    });

  });

  it('creates an instance when passed environment using params', function (next) {
    var 
      MyClass = function (params) {
        this.params = params;
      },
      beanDescr = {
        type: 'instance',
        src: MyClass,
        params: {
          'a': {
            type: 'instance',
            src: MyClass
          }
        }
      };

    instanceFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();

      factory({}, function (err, instance) {
        expect(err).toBeFalsy();
        expect(instance).toEqual(jasmine.any(MyClass));
        expect(instance.params.a).toEqual(jasmine.any(MyClass));
        next();
      });
    });

  });

});