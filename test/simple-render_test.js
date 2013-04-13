var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/ioco.page-designer');
var Webpage = require(__dirname+'/../public/javascripts/ioco.webpage');
var Webbit = require(__dirname+'/../public/javascripts/ioco.webbit');

var header = '<h1>header</h1>';
var bit1 = new Webbit({ name: 'bit1'});
bit1.setContent( header );

var content = '<p>content</p>';

var bit3 = new Webbit({ name: 'bit3'});
bit3.setContent( content );

var bit2 = new Webbit({ name: 'bit2', items: [ bit3 ] });
bit2.setContent( content + '<div data-ioco-id="'+bit3._id+'"></div>' );

var webpage = new Webpage({name: 'test', items: [
  bit1, bit2
  ]
});

webpage.setContent('<div data-ioco-id="'+bit1._id+'"></div><div data-ioco-id="'+bit2._id+'"></div>');

describe('ioco.pageDesigner', function(){

  describe('rendering webpage', function(){

    it( 'webpage should be an object', function(){
      webpage.should.be.a('object');
    });

    it( 'webpage should have 3 webbits in items property', function(){
      webpage.items.should.be.lengthOf(2);
    });

    it( 'webpage should render 3 webbits as content', function(){
      webpage.render().toString().should.equal('<div class="ioco-webpage "><div class="ioco-webbit default-span"><h1>header</h1></div><div class="ioco-webbit default-span"><p>content</p><div class="ioco-webbit default-span"><p>content</p></div></div></div>');
    })
  });

})