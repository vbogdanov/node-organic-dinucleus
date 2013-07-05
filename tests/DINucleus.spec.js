var Nucleus = require("../index");
var organic = require("organic");
var synapse = require("organic-synapse");

describe("Nucleus", function(){
  var plasma = {
    on: function () {}
    , emit: function () {}
  }

  var BasicOrganel = function (plasma, config) {
    this.superb = true;
    this.test = config.test;
  }

  function expectBasicOrganel (object) {
    expect(object).toBeTruthy();
    expect(object instanceof BasicOrganel).toBe(true);
    expect(object.superb).toBe(true);
  }
  
  it("creates singleton by name", function(){
    var success = false;
    nucleus = new Nucleus(plasma, {
      "example": { "_":"poso"
        , "source": BasicOrganel
      }
    });
    
    var object = nucleus.build("example");
    expectBasicOrganel(object);
    
    //confirm singleton
    var object2 = nucleus.build("example");
    expectBasicOrganel(object2);
    
    expect(object).toBe(object2);
  });
  
  it("creates prototypes by name", function(){
    nucleus = new Nucleus(plasma, {
      "example": { "_":"popo"
        , "source": BasicOrganel
      }
    });
    
    var object = nucleus.build("example");
    expectBasicOrganel(object);
    
    //confirm not singleton (new instance every time)
    var object2 = nucleus.build("example");
    expectBasicOrganel(object2);
    
    expect(object).not.toBe(object2);
  });
  
  it("creates mapFinal by name", function(){
    var map = { "_":"mapFinal"
      , "test": "success"
      , "done": "true"
    }
    
    nucleus = new Nucleus(plasma, {
      "example": map
    });
    
    var object = nucleus.build("example");
    expect(object).toEqual(map);
    
    //confirm not singleton (new instance every time)
    var object2 = nucleus.build("example");
        
    expect(object).toBe(object2);
  });
  
  it("returns ref by name", function(){
    var success = false;
    nucleus = new Nucleus(plasma, {
      "actual": { "_":"poso"
        , "source": BasicOrganel
      }
      , "example": {  "_":"ref"
        , "ref":"actual"
      }
    });
    
    var object = nucleus.build("example");
    expectBasicOrganel(object);
    
    //confirm singleton
    var object2 = nucleus.build("example");
    expectBasicOrganel(object2);
    
    expect(object).toBe(object2);
  });
  
  it("creates singletons when build() is invoked", function(){

    nucleus = new Nucleus(plasma, {
      "example": { "_":"poso"
        , "source": BasicOrganel
        , "config":{ "test": 1 }
      }
      , "example2": { "_":"poso"
        , "source": BasicOrganel
        , "config":{ "test": 2 } 
      }
    });
    
    var objects = nucleus.build();
    expect(objects.length).toBe(2);
    expectBasicOrganel(objects[0]);
    expectBasicOrganel(objects[1]);
    
    expect(objects[0].test).toBe(1);
    expect(objects[1].test).toBe(2);
  });
  
  it("passes addressed of injected objects", function(){
    var success = 0;
    nucleus = new Nucleus(plasma, {
      "example": { "_":"poso"
        , "source": function (plasma, config) {
          success ++;
          this.superb = true;
          this.config = config;
        }
        , "inject": {
          "target":{ "_":"poso"
            , "source": "tests/synapticReceiver"
          }
        }
      }
    });
    
    var object = nucleus.build("example");
    expect(object).toBeTruthy();
    expect(success).toBe(1);
    expect(object.superb).toBe(true);
    var address = object.config.target;
    expect(nucleus.organellesMap[address]).toBeTruthy();
    
  });
  
  it("allows sending messages to the injected objects", function(next){
    var success = 0;
    var DATA = {};
    var realPlasma = (new organic.Plasma()).use(synapse.Plasma);
    
    nucleus = new Nucleus(realPlasma, {
      "example": { "_":"poso"
        , "source": function (plasma, config) {
          success ++;
          this.superb = true;
          this.config = config;
        }
        , "inject": {
          "target":{ "_":"poso"
            , "source": "tests/synapticReceiver"
            , "config": {
              "messaged": function (data) {
                expect(data).toBe(DATA);
                console.log("I'm on top of the world!");
                next();
              }
            }
          }
        }
      }
    });
    
    var object = nucleus.build("example");
    expect(object).toBeTruthy();
    expect(success).toBe(1);
    expect(object.superb).toBe(true);
    var address = object.config.target; //this one should be private in normal organels
    expect(nucleus.organellesMap[address]).toBeTruthy();
    realPlasma.message(address, DATA);
  });
  
  it("allows sending messages to the injected objects", function(next){
    var success = 0;
    var DATA = {};
    var realPlasma = (new organic.Plasma()).use(synapse.Plasma);
    
    nucleus = new Nucleus(realPlasma, {
      "example": { "_":"poso"
        , "source": function (plasma, config) {
          success ++;
          this.superb = true;
          this.config = config;
        }
        , "inject": {
          "target":{ "_":"poso"
            , "source": "tests/synapticReceiver"
            , "config": {
              "messaged": function (data) {
                console.log("outer injected");
                //this is config
                expect(data).toBe(DATA);
                //plasma will be accessible from the organel
                realPlasma.message(this.hello, DATA);
              }
            }
            , "inject": {
              "hello": { "_":"poso"
                , "source": "tests/synapticReceiver"
                , "config": {
                  "messaged": function (data) {
                    expect(data).toBe(DATA);
                    console.log("inner injected");
                    next();
                  }
                }
              }
            }
          }
        }
      }
    });
    
    var object = nucleus.build("example");
    expect(object).toBeTruthy();
    expect(success).toBe(1);
    expect(object.superb).toBe(true);
    var address = object.config.target;
    expect(nucleus.organellesMap[address]).toBeTruthy();
    realPlasma.message(address, DATA);
  });
  
  it("allows adding new types of entities (in addition to popo, poso, mapFinal and ref)", function () {
    var realPlasma = (new organic.Plasma()).use(synapse.Plasma);
    var expected = { 'expected':true };
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
    Nucleus.entries.test = function () {
      var res = function () {
        return expected;
      }
      res.singleton = true;
      return res;
    }
    
    nucleus = new Nucleus(plasma, {
      "example": { '_':'test'
        //nothing here
      }
    });
    
    var object = nucleus.build("example");
    expect(object).toBe(expected);
  });
});