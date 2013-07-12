/* global describe: false */
/* global it: false */
/* global expect: false */
/* jshint maxstatements: 30 */
'use strict';

var Nucleus = require('../index');
//depends on node-organic, but not in code

describe('Nucleus', function(){
  var plasma = {
    on: function () {},
    emit: function () {}
  };

  var BasicOrganel = function (plasma, config) {
    this.superb = true;
    this.test = config.test;
  };

  function expectBasicOrganel (object) {
    expect(object).toBeTruthy();
    expect(object instanceof BasicOrganel).toBe(true);
    expect(object.superb).toBe(true);
  }
  
  it('creates singleton by name', function(){
    var success = false;
    var nucleus = new Nucleus(plasma, {
      'example': { '_':'poso',
        'source': BasicOrganel
      }
    });
    
    var object = nucleus.build('example');
    expectBasicOrganel(object);
    
    //confirm singleton
    var object2 = nucleus.build('example');
    expectBasicOrganel(object2);
    expect(object).toBe(object2);
  });
  
  it('creates prototypes by name', function(){
    var nucleus = new Nucleus(plasma, {
      'example': { '_':'popo',
        'source': BasicOrganel
      }
    });
    
    var object = nucleus.build('example');
    expectBasicOrganel(object);
    
    //confirm not singleton (new instance every time)
    var object2 = nucleus.build('example');
    expectBasicOrganel(object2);
    expect(object).not.toBe(object2);
  });
  
  it('creates mapFinal by name', function(){
    var map = { '_':'mapFinal',
      'test': 'success',
      'done': 'true'
    };
    
    var nucleus = new Nucleus(plasma, {
      'example': map
    });
    
    var object = nucleus.build('example');
    expect(object).toEqual(map);
    
    //confirm not singleton (new instance every time)
    var object2 = nucleus.build('example');
        
    expect(object).toBe(object2);
  });
  
  it('returns ref by name', function(){
    var success = false;
    var nucleus = new Nucleus(plasma, {
      'actual': { '_':'poso',
        'source': BasicOrganel
      },
      'example': {  '_':'ref',
        'ref':'actual'
      }
    });
    
    var object = nucleus.build('example');
    expectBasicOrganel(object);
    
    //confirm singleton
    var object2 = nucleus.build('example');
    expectBasicOrganel(object2);
    
    expect(object).toBe(object2);
  });
  
  it('creates singletons when build() is invoked', function(){

    var nucleus = new Nucleus(plasma, {
      'example': { '_':'poso',
        'source': BasicOrganel,
        'config':{ 'test': 1 }
      },
      'example2': { '_':'poso',
        'source': BasicOrganel,
        'config':{ 'test': 2 } 
      }
    });
    
    var objects = nucleus.build();
    expect(objects.length).toBe(2);
    expectBasicOrganel(objects[0]);
    expectBasicOrganel(objects[1]);
    
    expect(objects[0].test).toBe(1);
    expect(objects[1].test).toBe(2);
  });
    
  it('injects objects as part of the config', function(done){
    var DATA = {};
    
    var nucleus = new Nucleus(plasma, {
      'example': { '_':'poso',
        'source': BasicOrganel,
        'inject': {
          'test':{ '_':'poso',
            'source': 'tests/synapticReceiver',
            'config': {
              'messaged': function (data) {
                expect(data).toBe(DATA);
                done();
              }
            }
          }
        }
      }
    });
    
    var object = nucleus.build('example');
    expectBasicOrganel(object);
    object.test.message(DATA);
  });
  
  it('support nested injection definition', function(done){
    var DATA = {};
    
    var nucleus = new Nucleus(plasma, {
      'example': { '_':'poso',
        'source': BasicOrganel,
        'inject': {
          'test':{ '_':'poso',
            'source': 'tests/synapticReceiver',
            'config': {
              'messaged': function (data) {
                console.log('outer injected');
                //this is config
                expect(data).toBe(DATA);
                //plasma will be accessible from the organel
                this.hello.message(DATA);
              }
            },
            'inject': {
              'hello': { '_':'poso',
                'source': 'tests/synapticReceiver',
                'config': {
                  'messaged': function (data) {
                    expect(data).toBe(DATA);
                    console.log('inner injected');
                    done();
                  }
                }
              }
            }
          }
        }
      }
    });
    
    var object = nucleus.build('example');
    expectBasicOrganel(object);
    object.test.message(DATA);
  });
  
  it('allows adding new types of entities (in addition to popo, poso, mapFinal and ref)', function () {
    var expected = { 'expected':true };
    
        
    var nucleus = new Nucleus(plasma, {
      'example': { '_':'test'
        //nothing here
      }
    });

    /* from lib/DINucleus.js:
      * 
      * This object (DINucleus.entries) describes all possible entity types ('_' values)
      * each entity is described by a function that
      * 1. is invoked in the context of a DINucleus instance
      * 2. is passed the json describing the entity as its only parameter
      * 3. returning a factory function that:
      *      3.1 accepts no parameters
      *      3.2 has a property 'singleton' that equals true if multiple invocations result in the same instance
      *
      */
    nucleus.entries.test = function () {
      var res = function () {
        return expected;
      };
      res.singleton = true;
      return res;
    };
    
    var object = nucleus.build('example');
    expect(object).toBe(expected);
  });
  
  it('recognizes ref shorthand', function(){
    var success = false;
    var nucleus = new Nucleus(plasma, {
      'actual': { '_':'poso',
        'source': BasicOrganel
      },
      'example': '#actual'
    });
    
    var object = nucleus.build('example');
    expectBasicOrganel(object);
    
    //confirm singleton
    var object2 = nucleus.build('example');
    expectBasicOrganel(object2);
    
    expect(object).toBe(object2);
  });
});