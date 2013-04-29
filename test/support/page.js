var P = require('pjs').P,
    expect = require('chai').expect;

var Page = P(function(page){
  page.init = function(browser){
    this.browser = browser;
  }

  page.shouldHaveContent = function(/* args */){
    var options = contentArgs(arguments),
        text = this.browser.text(options.selector),
        content = new RegExp(options.content);

    expect(text).to.match(content);
  }

  function contentArgs(args){
    var options = {};
    switch(args.length){
      case 1:
      options.content = args[0];
      break;

      case 2:
      options.selector = args[0];
      options.content = args[1];
      break;
    }

    return options;
  }
});

module.exports = Page;