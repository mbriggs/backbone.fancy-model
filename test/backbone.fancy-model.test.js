describe("Backbone fancy model", function(){
  "use strict";

  describe("accessors", function(){
    var model;
    var Model = Backbone.FancyModel.extend({
      fooSet: function(val){
        return "yum " + val;
      }
    });

    beforeEach(function(){
      model = new Model({ foo: 'bar', bin: 'baz' });
    });

    it("can be defined", function(){
      expect(model.get('foo')).to.eq('yum bar');
    });

    it("doesn't block default get behavior", function(){
      expect(model.get('bin')).to.eq('baz');
    });
  });

  describe("mutators", function(){
    var model;
    var Model = Backbone.FancyModel.extend({
      fooSet: function(val){
        return "yum " + val;
      },

      anotherFooSet: function(val){
        return "another! " + val
      }
    });

    beforeEach(function(){
      model = new Model({ foo: 'bar', anotherFoo: 'blah', bin: 'baz' });
    });

    it("can be defined", function(){
      model.set('foo', 'blech');
      expect(model.get('foo')).to.eq('yum blech');
    });

    it("handles multi-set", function(){
      model.set({ foo: 'foo1', anotherFoo: 'foo2' });
      expect(model.get('foo')).to.eq('yum foo1');
      expect(model.get('anotherFoo')).to.eq('another! foo2');
    });

    it("doesn't block default set behavior", function(){
      model.set('bin', 'blech');
      expect(model.get('bin')).to.eq('blech');
    });
  });

  describe("computed", function(){
    var model;
    var Model = Backbone.FancyModel.extend({
      computed: {
        'foo <- bar bin': function(bar, bin){
          return bar + bin;
        }
      }
    });


    beforeEach(function(){
      model = new Model({ bar: 1, bin: 2 });
    });

    it("has an initial computed value", function(){
      expect(model.get('foo')).to.eq(3);
    });

    it("changes when dependancy changes", function(){
      model.set('bar', 10);
      expect(model.get('foo')).to.eq(12);
    });

    it("changes when other dependancy changes", function(){
      model.set({bin: 10});
      expect(model.get('foo')).to.eq(11);
    });
  });
});
