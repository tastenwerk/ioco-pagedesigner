var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/iokit.page-designer');

describe('iokit.pageDesigner', function(){

  // add an empty plugin for making the tests pass
  before( function(){
    pageDesigner.addPlugin({name: 'empty'});
  })

  describe('WebPage', function(){
    
    var WebBit = pageDesigner.WebBit;

    it( 'is a nestable most tiny bit of the pageDesigner model structure', function(){
      WebBit.should.be.a('function');
    });

    describe( 'attributes parameter', function(){

      describe( 'object - attrs', function(){
        it( 'takes an object with attributes as parameter', function(){
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

        describe( '@renderedContent', function(){

          it( 'takes a content attribute and turns it into renderedContent observable method, which will used for the initialized WebBit information', function(){
            var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: '' });
            webBit.renderedContent.should.be.a('string')
          });
        });

        describe( '@setRenderedContent', function(){

          it( 'takes a content attribute and turns it into setRenderedContent observable method, which will used for the initialized WebBit information', function(){
            var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: '' });
            webBit.setRenderedContent('val');
            webBit.renderedContent.should.eql('val');
          });

        })

      });

      describe( 'string - lang', function(){

        it( 'takes an optional parameter defining the language this webbit should be initialized with', function(){
          var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: { de: 'de', en: 'en'} }, 'de' );
          webBit.renderedContent.should.eql('de');
        });

        it( 'will fallback to given fallbackLang if passed in as 3rd parameter', function(){
          var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: { en: 'en'} }, 'de', 'en' );
          webBit.renderedContent.should.eql('en');
        });

        it( 'won\' accept a lang parameter if the lang key is not present and no fallback is given', function(){
          (function(){ new WebBit( { pluginName: 'empty', name: 'first', content: { en: 'en' } }, 'de' ) }).should.throw(/lang key not present/);
        });

      })

    });

    describe('#observable', function(){
      
      it( 'defines a new observable property', function(){
        var webBit = new WebBit({ name: 'first', pluginName: 'empty' });
        webBit.observable('myprop');
        webBit.myprop.should.be.a('string');
      })

    });

    describe( '#initialize', function(){
      
      var webBit
        , webBitJSON;

      before( function( done ){

        // load emptyContainer plugin
        pageDesigner.addPlugin( require(__dirname+'/../public/javascripts/iokit/pageDesigner/plugins/empty-container') );

        var fs = require('fs');
        fs.readFile( __dirname+'/../demo/dummy/web_bits/wb2.json', function( err, jsonStr ){
          webBitJSON = JSON.parse(jsonStr);
          webBit = new WebBit( webBitJSON );
          done();
        })
      });

      it( 'provides renderedContent formatted as html', function(){
        webBit.renderedContent.should.eql( webBitJSON.content )
      });

      it( 'changing the content in html will allways sync with the actual content object but keep it free from nested WebBit content', function(){
        webBit.setRenderedContent('<p>other</p>');
        webBit.content.should.eql('<p>other</p>');
      })

    })

  });

})