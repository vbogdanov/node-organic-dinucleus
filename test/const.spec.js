/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var 
  constFF = require('../src/types/const'),
  Context = require('../src/context'),
  loader = function (name, done) {
    var clazz = require(name);
    done(false, clazz);
  },
  context = new Context('instance', loader, { 'const': constFF }, {});


describe('Const', function () {
  
  it('FactoryFactory is a function', function () {
    expect(constFF).toEqual(jasmine.any(Function));
  });

  it('returns a Factory when passed bean description and context', function (next) {
    var beanDescr = {
      type: 'const',
      value: 42
    };

    constFF({ 'bean': beanDescr, 'context': context } , function(err, factory) {
      expect(err).toBeFalsy();
      expect(factory).toEqual(jasmine.any(Function));
      next();
    });
  });

  it('creates an instance when passed environment - simple value', function (next) {
    var beanDescr = {
      type: 'const',
      value: 42
    };

    constFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();

      factory({}, function (err, result) {
        expect(result).toEqual(42);
        expect(err).toBeFalsy();
        next();
      });
    });

  });

  it('creates an instance when passed environment - object', function (next) {
    var 
    expected = {
      'a': 42
    },
    beanDescr = {
      type: 'const',
      value: expected
    };

    constFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();

      factory({}, function (err, result) {
        expect(err).toBeFalsy();
        expect(result).toEqual(expected);
        next();
      });
    });

  });

});