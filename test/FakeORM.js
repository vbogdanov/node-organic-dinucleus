/* global describe: false */
/* global it: false */
/* global expect: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([], function () {
  return function (params) {
    this.datasource = params.db;
  };
});