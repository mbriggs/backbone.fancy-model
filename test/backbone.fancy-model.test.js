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

    it("changes when dependency changes", function(){
      model.set('bar', 10);
      expect(model.get('foo')).to.eq(12);
    });

    it("changes when other dependency changes", function(){
      model.set({bin: 10});
      expect(model.get('foo')).to.eq(11);
    });
  });

  describe("relations", function() {
    describe("simple setup", function() {
      var Related = Backbone.Model.extend({});
      var Model = Backbone.FancyModel.extend({
        relations: {
          "foo" : Related
        }
      });


      it("creates a model called foo", function() {
        var model = new Model({ foo: { attr: 10 } });
        expect(model.foo.get('attr')).to.eq(10)
      });

      it("removes foo attrs from model attrs", function() {
        var model = new Model({ foo: { attr: 10 } });
        expect(model.get('foo')).to.eq(undefined);
      });

      it("serializes model attrs with foo attrs", function() {
        var model = new Model({ foo: { attr: 10 } });
        expect(model.toJSON().foo.attr).to.eq(10);
      });
    });

    describe("with different name", function() {
      var Related = Backbone.Model.extend({});
      var Model = Backbone.FancyModel.extend({
        relations: {
          "foo" : {
            attribute: 'bar',
            isA: Related
          }
        }
      });

      it("creates a model called foo", function(){
        var model = new Model({ bar: { attr: 10 } });
        expect(model.foo.get('attr')).to.eq(10)
      })
    });
  });
});
