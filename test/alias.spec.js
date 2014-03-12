/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var 
aliasFF = require('../src/types/alias'),
Context = require('../src/context'),
loader = function (name, done) {
  var clazz = require(name);
  done(false, clazz);
},
context = new Context('instance', loader, { 'alias': aliasFF }, {}),
otherBean = {
  'bar': {},
  'foo': 42
},
environment = {
  get: function (name, done) {
    done(false, otherBean);
  }
};


describe('Alias', function () {
  
  it('FactoryFactory is a function', function () {
    expect(aliasFF).toEqual(jasmine.any(Function));
  });

  it('returns a Factory when passed bean description and context', function (next) {
    var beanDescr = {
      type: 'alias',
      id: 'bar'
    };

    aliasFF({ 'bean': beanDescr, 'context': context } , function(err, factory) {
      expect(err).toBeFalsy();
      expect(factory).toEqual(jasmine.any(Function));
      next();
    });
  });

  it('creates an instance when passed environment', function (next) {
    var beanDescr = {
      type: 'alias',
      id: 'bar'
    };

    aliasFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();

      factory(environment, function (err, result) {
        expect(result).toEqual(otherBean);
        expect(err).toBeFalsy();
        next();
      });
    });

  });

});