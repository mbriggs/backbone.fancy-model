"use strict";
(function() {
  var FancyModel = Backbone.FancyModel = Backbone.Model.extend({});

  var inject = FancyModel.mixInto = function(target) {
    var Model = target.prototype;
    var targetGet = Model.get;
    var targetSet = Model.set;
    var targetInit = Model.initialize;
    var targetToJSON = Model.toJSON;

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
      initializeComputedProperties(this);
      initializeRelations(this);
    };

    Model.toJSON = function(){
      var result = targetToJSON.apply(this, arguments);
      return _.extend(result, serializeRelations(this));
    }
  };

  inject(FancyModel);

  // backbone class

  var Class = function() {
    this.initialize.apply(this, arguments)
  };
  Class.extend = Backbone.Model.extend;
  Class.prototype.initialize = function() {
  };

  // args parser

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

  // relations

  function initializeRelations(model){
    var cache = model.__relations = [];
    _.each(model.relations, function(args, name){
      var rel = new Relation(name ,args);
      var attrs = model.get(rel.attribute);
      cache.push(rel);
      model.unset(rel.attribute);

      model.set(rel.name, new rel.implementation(attrs));
    });
  }
  
  function serializeRelations(model){
    var obj = {};
    _.each(model.__relations, function(rel){
      obj[rel.attribute] = model.get(rel.name).toJSON();
    });
    return obj;
  }

  // args is either a config object, or a model class
  function Relation(name, args){
    if(typeof args === 'function'){
      this.name = camelize(name);
      this.implementation = args;
      this.attribute = name;
    } else {
      this.name = name;
      this.implementation = args.isA;
      this.attribute = args.attribute;
    }
  }


  // computed properties


  function initializeComputedProperties(model){
    _.each(model.computed, function(compute, definition) {
      var property = new ComputedProperty(definition, compute);
      var perform = property.handlerFor(model);

      model.on(property.events, perform);
      perform(); // set initial value
    });
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
