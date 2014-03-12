/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var 
  execFF = require('../src/types/exec'),
  Context = require('../src/context'),
  loader = function (name, done) {
    var clazz = require(name);
    done(false, clazz);
  },
  context = new Context('instance', loader, { 'exec': execFF }, {});


describe('Exec', function () {
  
  it('FactoryFactory is a function', function () {
    expect(execFF).toEqual(jasmine.any(Function));
  });

  it('returns a Factory when passed bean description and context', function (next) {
    var beanDescr = {
      type: 'exec',
      src: function () {}
    };

    execFF({ 'bean': beanDescr, 'context': context } , function(err, factory) {
      expect(err).toBeFalsy();
      expect(factory).toEqual(jasmine.any(Function));
      next();
    });
  });

  it('creates an instance when passed environment', function (next) {
    var 
    myFunc = function () { return 42; },
    beanDescr = {
      type: 'exec',
      src: myFunc
    };

    execFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();

      factory({}, function (err, object) {
        expect(object).toEqual(42);
        expect(err).toBeFalsy();
        next();
      });
    });

  });

  it('creates an instance when passed environment reading arguments', function (next) {
    var 
    myFunc = function (value) { return value * 10; },
    beanDescr = {
      type: 'exec',
      src: myFunc,
      args: [{'type': 'exec', 'src': function () { return 42;}}]
    };

    execFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();
      factory({}, function (err, result) {
        expect(err).toBeFalsy();
        expect(result).toEqual(420);
        next();
      });
    });

  });

});