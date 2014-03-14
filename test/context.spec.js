/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var 
requirejs = require('requirejs'),
Context = require('../src/context'),
loader = function (name, done) {
  requirejs([name], function (mod) {
    done(false, mod);
  });
},
factoryFactories = {
  'instance':require('../src/types/instance'),
  'alias': require('../src/types/alias'),
  'const': require('../src/types/const')
},
shorthands = {
  '#':['alias','id'],
  '=':['const', 'value']
};

requirejs.config({
  baseUrl: process.env.PWD //nodejs only
});

describe('Context', function () {
  it('is a constructor function', function () {
    expect(Context).toEqual(jasmine.any(Function));
  });


  describe('instance', function () {
    var context;
    beforeEach(function () {
      context = new Context('instance', loader, factoryFactories, shorthands);
    });

    it('creates bean description from shorthand', function () {
      expect(context.createBeanDesc('#pesho')).toEqual({
        type:'alias',
        id:'pesho'
      });

      expect(context.createBeanDesc('=13')).toEqual({
        type:'const',
        value:'13'
      });
    });

    it('loads by name', function (next) {
      context.loadByName('test/sampleModule', function(err, clazz) {
        expect(err).toBeFalsy();
        expect(clazz).toEqual(42);
        next();
      });
    });

    it('creates bean factories from description or shorthand', function (next) {
      function SimpleClass(params) {
        this.x = params.x;
        this.y = params.y;
      }
      var beanDescr = {
        type: 'instance',
        src: SimpleClass,
        params: {
          x: '=ala',
          y: '=bala'
        }
      };
      context.createBeanFactory(beanDescr, function (err, factory) {
        expect(err).toBeFalsy();
        expect(factory).toEqual(jasmine.any(Function));

        factory({}, function (err, value) {
          expect(err).toBeFalsy();
          expect(value).toEqual(new SimpleClass({
            x:'ala',
            y:'bala'
          }));

          next();
        });
      });
    });
  });


});
