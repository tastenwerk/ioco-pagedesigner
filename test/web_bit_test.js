var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/iokit.page-designer');

describe('iokit.pageDesigner', function(){

  // add an empty plugin for making the tests pass
  before( function(){
    pageDesigner.addPlugin({name: 'empty'});
  })

  describe('WebBit', function(){
    
    var WebBit = pageDesigner.WebBit;

    it( 'is the basic and most tiny bit of the pageDesigner', function(){
      WebBit.should.be.a('function');
    })

    describe( 'attributes parameter', function(){

      it( 'an object as attriubte', function(){
        var webBit = new WebBit( { pluginName: 'empty', name: 'first' });
        webBit.should.have.property('pluginName');
      });

      it( 'won\'t create a new WebBit if no plugin name is specified', function(){
        (function(){ new WebBit( { name: 'first' } ) }).should.throw(/pluginName key must be present/);
      });

      it( 'won\'t create a new WebBit without a name given', function(){
        (function(){ new WebBit( { pluginName: 'empty' } ) }).should.throw(/name key must be present/);
      });

      it( 'won\'t create a new WebBit with an unknown plugin', function(){
        (function(){ new WebBit( { pluginName: 'unknonw' } ) }).should.throw(/pluginName not found in _plugins registry/);
      });

      describe( '_content', function(){

        it( 'takes a content attribute and turns it into _renderedContent which will used for the initialized WebBit information', function(){
          var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: '' });
          webBit.should.have.property('_renderedContent');
        })

      })

    });

    describe( 'lang parameter', function(){

      it( 'takes an optional parameter defining the language this webbit should be initialized with', function(){
        var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: { de: 'de', en: 'en'} }, 'de' );
        webBit.should.have.property('_renderedContent');
        webBit._renderedContent.should.eql('de');
      })

      it( 'will fallback to given fallbackLang if passed in as 3rd parameter', function(){
        var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: { en: 'en'} }, 'de', 'en' );
        webBit.should.have.property('_renderedContent');
        webBit._renderedContent.should.eql('en');
      })

      it( 'won\' accept a lang parameter if the lang key is not present and no fallback is given', function(){
        (function(){ new WebBit( { pluginName: 'empty', name: 'first', content: { en: 'en' } }, 'de' ) }).should.throw(/lang key not present/);
      })

    })

  });

})