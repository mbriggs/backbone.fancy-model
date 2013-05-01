# FancyModel

Backbone models take a philosophy of being observable wrappers over objects. While sometimes that is all you need, I found myself needing computed properties in virtually every project, and when I didn't, I needed get or set hooks. The other thing I found lacking over and over again is some way to handle relationships between models.

There are plugins that handle both of those things, but in most cases they are fairly elaborate. Sometimes my needs are elaborate, so I will use them, but most of the time, I have a problem bringing in 2000 lines of code, for something I could do manually in 5-6 lines.

This library exists to meet the minimal base requirements in a minimal fashion.

## Usage

Basic usage is to extend `Backbone.FancyModel` instead of `Backbone.Model`. 

Sometimes that is not ideal, since many model plugins expect you to use their own "base" model, or you are fine with monkey patching, and don't want to change your codebase. In these cases, `Backbone.FancyModel.mixInto` is provided. For example, to inject FancyModel functionality into the base backbone model, simply do

    Backbone.FancyModel.mixInto(Backbone.Model);

## Computed Properties

Computed properties are properties which have dependancies on other properties in your model. Any time those other properties change, the computed property is re-computed.

The syntax for this is

```
var MyModel = Backbone.FancyModel.extend({
  computed: {
    'myComputedProperty <- dependancy1 dependancy2': function(dep1, dep2){
      return dep1 * dep2;
    }
  }
}

var foo = new MyModel({ dependancy1: 10, dependancy2: 5 });
foo.get('myComputedProperty'); //=> 50
foo.set('dependancy2', 2);
foo.get('myComputedProperty'); //=> 20
```

## Get / Set hooks

Unfortunately, we need to go through get/set in order for backbone models to be able to observe changes. One benefit you usually get by a level of indirection in property manipulation is the ability to change properties as they enter/leave your model, but backbone does not provide this capability, while still requiring you to go through methods rather then interact directly with properties.

`FancyModel` adds this capability by providing "hooks" into the process. An example of using a set hook

```
var MyModel = Backbone.FancyModel.extend({
	someString: function(value){
    return value.toString();
  }
});

var model = new MyModel();
model.set('someString', 10);
model.get('someString'); //=> "10"

// this will also translate to wide_cased variable names

model.set('some_string', 10);
model.get('some_string'); //=> "10"
```

Why the wide_case translation? Because I use rails, and in ruby (and many other languages), the convention is to use wide_case for variable names. This allows for convention based configuration, while still allowing for maintaining the idioms in both languages.

## Relations

`FancyModel` implements relation support in the absolutely most simple way possible. The biggest thing that you may find missing is a "backreference" to the containing model.

Typically, these sorts of bi-directional associations are a "code smell", and if you find yourself needing it, I would suggest thinking about how things would look without it. That being said, there are plenty of valid reasons to have it, and it may get added to the library one day as an option.

There is no distinction between a "has many" or a "group by", all that is required is that the implementation class implements   `toJSON`, and takes its attributes through the constructor.

A simple usage would be

```
var RelatedModel = Backbone.Model.extend({});

var MyModel = Backbone.FancyModel.extend({
	relations: {
  	related_model: RelatedModel
  }
});

var model = new MyModel({ related_model: { attr: 10 } });
// wide_case gets translated into camelHumps
model.relatedModel.get('attr'); //=> 10

// related attributes are removed from the model
// as they are now managed elsewhere
model.get('related_model'); //=> undefined

// the relation is serialized back into the containing model
model.toJSON(); //=> { related_model: { attr: 10 } }
```

Sometimes, you want a different name for the attribute then for the accessor. This is supported by a config object syntax. Note that in this case, accessor names are not going to be translated from wide_case into camelHumps, since both are explicitly provided.

```
// equivalent to the previous example
var MyModel = Backbone.FancyModel.extend({
  relations: {
    relatedModel: {
      attribute: 'related_model',
			isA: RelatedModel
		}
	}
}
```


