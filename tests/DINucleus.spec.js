var Nucleus = require("../index");

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
});