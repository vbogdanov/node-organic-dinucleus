var Nucleus = require("../index");
var organic = require("organic");
var synapse = require("organic-synapse");

describe("Nucleus", function(){
  var plasma = {
    on: function () {}
    , emit: function () {}
  }


  it("creates singleton by name", function(){
    var success = false;
    nucleus = new Nucleus(plasma, {
      "example": { "_":"poso"
        , "source": function (plasma, config) {
          success = true;
          this.superb = true;
        }
      }
    });
    
    var object = nucleus.build("example");
    expect(object).toBeTruthy();
    expect(success).toBe(true);
    expect(object.superb).toBe(true);
  });
  
  
  it("creates singletons when build() is invoked", function(){
    var success = 0;
    nucleus = new Nucleus(plasma, {
      "example": { "_":"poso"
        , "source": function (plasma, config) {
          success ++;
          this.superb = true;
        }
      }
      , "example2": { "_":"poso"
        , "source": function (plasma, config) {
          success ++;
          this.alpha = true;
        }
      }
    });
    
    var objects = nucleus.build();
    expect(objects.length).toBe(2);
    expect(objects[0]).toBeTruthy();
    expect(objects[1]).toBeTruthy();
    
    expect(success).toBe(2);
    expect(objects[0].superb).toBe(true);
    expect(objects[1].alpha).toBe(true);
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
    var address = object.config.target;
    expect(nucleus.organellesMap[address]).toBeTruthy();
    realPlasma.message(address, DATA);
  });
});