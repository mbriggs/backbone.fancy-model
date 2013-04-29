"use strict";
(function() {
  var FancyModel = Backbone.FancyModel = Backbone.Model.extend({});

  var inject = FancyModel.mixInto = function(target) {
    var Model = target.prototype;
    var targetGet = Model.get;
    var targetSet = Model.set;
    var targetInit = Model.initialize;

    /// getters / setters

    Model.get = function(attr) {
      var val = targetGet.apply(this, arguments);

      return maybeApply(this, attr + '-get', val);
    };

    Model.set = function(/* arguments */) {
      var args = new SetArguments(arguments)
        , model = this;

      _.each(args.attrs, function(val, attr) {
        args.attrs[attr] = maybeApply(model, attr + '-set', val);
      });

      targetSet.call(model, args.attrs, args.options);
    };

    Model.initialize = function() {
      targetInit.apply(this, arguments);
      var model = this;

      _.each(this.computed, function(compute, definition) {
        var property = new ComputedProperty(definition, compute);
        var perform = property.handlerFor(model);

        model.on(property.events, perform);
        perform(); // set initial value
      });
    };
  };

  inject(FancyModel);


  // stuff

  var Class = function() {
    this.initialize.apply(this, arguments)
  };
  Class.extend = Backbone.Model.extend;
  Class.prototype.initialize = function() {
  };

  function SetArguments(args) {
    if(_.isObject(args[0])){
      this.attrs = args[0];
      this.options = args[1];
    } else if(args[0] == null){
      this.options = args[1];
    } else {
      this.attrs = {};
      this.attrs[args[0]] = args[1];
      this.options = args[2];
    }
  }

  var ComputedProperty = Class.extend({
    initialize: function(definition, compute) {
      var tokens = definition.split(' <- ');
      this.name = tokens[0];
      this.dependancies = tokens[1].split(' ');
      this.events = _(this.dependancies).
        map(function(attr) {
          return 'change:' + attr
        }).
        join(' ');
      this.compute = compute;

      _.bindAll(this)
    },

    handlerFor: function(model) {
      var property = this;

      return function() {
        var vals = multiGet(model, property.dependancies);
        var computed = property.compute.apply(model, vals);

        model.set(property.name, computed);
      }
    }
  });


  /// defuns

  function multiGet(model, fields) {
    var vals = [];

    for(var i = 0; i < fields.length; i++){
      vals.push(model.attributes[ fields[i] ]);
    }

    return vals;
  }

  function maybeApply(obj, method, arg) {
    var value = arg;
    method = camelize(method);

    if(obj[method]) value = obj[method](arg);

    return value;
  }

  function camelize(str) { // more or less from prototype
    return str.replace(/[-_]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }
}());
