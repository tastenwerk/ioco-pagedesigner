var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/ioco.page-designer');
var Webpage = require(__dirname+'/../public/javascripts/ioco.webpage');
var Webbit = require(__dirname+'/../public/javascripts/ioco.webbit');

var header = '<h1>header</h1>';
var bit1 = new Webbit({ name: 'bit1', _id: 'bit1' });
bit1.setContent( header );

var bit2 = new Webbit({ name: 'bit2', pluginName: 'server-side-test', _id: 'bit2' });
bit2._scriptedContent = 'test scripted';

var webpage = new Webpage({name: 'test', items: [
  bit1, bit2
  ]
});

webpage.setContent('<div data-ioco-id="'+bit1._id+'"></div><div data-ioco-id="'+bit2._id+'"></div>');

describe('ioco.pageDesigner', function(){

  describe('rendering webpage', function(){

    it( 'webpage should render 1 normal webbit and 1 serverside processed webbit', function(){
      webpage.render().toString().should.equal('<div class="ioco-webpage "><div class="ioco-webbit default-span"><h1>header</h1></div><div class="ioco-webbit default-span">test scripted</div></div>');
    })
  });

})