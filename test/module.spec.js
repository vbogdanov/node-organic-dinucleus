/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var 
  moduleFF = require('../src/types/module'),
  Context = require('../src/context'),
  loader = function (name, done) {
    var clazz = require(name);
    done(false, clazz);
  },
  context = new Context('instance', loader, { 'module': moduleFF }, {}),
  requirejs = require('requirejs');

requirejs.config({
  baseUrl: process.env.PWD //nodejs only
});

describe('Const', function () {
  
  it('FactoryFactory is a function', function () {
    expect(moduleFF).toEqual(jasmine.any(Function));
  });

  it('returns a Factory when passed bean description and context', function (next) {
    var beanDescr = {
      type: 'module',
      name: 'test/sampleModule'
    };

    moduleFF({ 'bean': beanDescr, 'context': context } , function(err, factory) {
      expect(err).toBeFalsy();
      expect(factory).toEqual(jasmine.any(Function));
      next();
    });
  });

  it('creates an instance when passed environment - simple value', function (next) {
    var beanDescr = {
      type: 'module',
      name: 'test/sampleModule'
    };

    moduleFF({ 'bean': beanDescr, 'context': context }, function(err, factory) {
      expect(err).toBeFalsy();
      
      factory({}, function (err, result) {
        expect(result).toEqual(42);
        expect(err).toBeFalsy();
        next();
      });
    });

  });

});