/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var requirejs = require('requirejs');
requirejs.config({
  baseUrl: process.env.PWD //nodejs only
});



describe('DIContainer', function () {
  var DIC;

  beforeEach(function (next) {
    requirejs(['src/dicontainer'], function (dicontainer) {
      DIC = dicontainer;
      next();
    });
  });

  it('is a reaction function', function () {
    expect(DIC).toEqual(jasmine.any(Function));
  });


  describe('generated environment', function () {
    var env;
    var config = {
      'context': {
        dbconfig: {
          type: 'const',
          value: {
            'host': 'dbserver.example.com',
            'port': 3306,
            'schema': 'example',
            'user': 'node-app',
            'pass': '******'
          }
        },
        orm: {
          src: 'test/FakeORM',
          params: {
            db: '#dbconfig'
          }
        },
        proto: {
          scope:'prototype',
          src: function () {}
        }
      }
    };

    beforeEach(function (next) {
      DIC(config, function (err, _env) {
        env = _env;
        -next();
      });
    });

    it('can provide dbconfig', function (next) {
      env.get('dbconfig', function (err, dbconfig) {
        expect(err).toBeFalsy();
        expect(dbconfig).toEqual({
          'host': 'dbserver.example.com',
          'port': 3306,
          'schema': 'example',
          'user': 'node-app',
          'pass': '******'
        });
        next();
      });
    });

    it('can provide orm', function (next) {
      env.get('orm', function (err, orm) {
        expect(err).toBeFalsy();
        expect(orm).toBeTruthy();
        expect(orm.datasource).toEqual({
          'host': 'dbserver.example.com',
          'port': 3306,
          'schema': 'example',
          'user': 'node-app',
          'pass': '******'
        });
        next();
      });
    });

  });


});

