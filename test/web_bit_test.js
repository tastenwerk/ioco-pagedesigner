var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/iokit.page-designer')
  , testHelper = require(__dirname+'/page-designer_test_helper');

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

        describe( '@cleanup', function(){

          it( 'takes a content attribute and turns it into cleanup observable method, which will used for the initialized WebBit information', function(){
            var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: '' });
            webBit.cleanup('val');
            webBit.render().should.eql('val');
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

    describe( '#new', function(){
      
      before( function( done ){
        testHelper.load.call(this, 'WebBit', 'wb2', done );
      });

      it( 'provides renderedContent formatted as html', function(){
        this.webBit.renderedContent.should.eql( this.webBitJSON.content )
      });

      it( 'changing the content in html will allways sync with the actual content object but keep it free from nested WebBit content', function(){
        this.webBit.cleanup('<p>other</p>');
        this.webBit.content.should.eql('<p>other</p>');
      });

    });

    describe( '#initialize empty WebBit', function(){

      before( function( done ){
        testHelper.load.call(this, 'WebBit', 'wb2', done );
      });

      it( 'initializes all sub WebBits of this webBit', function( done ){
        this.webBit.initialize( function( err, webBit ){
          should.not.exist(err);
          webBit.webBits.should.have.lengthOf(0);
          done();
        });
      });

    });

    describe( '#initialize WebBit with nested WebBits', function(){

      before( function( done ){
        testHelper.load.call(this, 'WebBit', 'wb0', done );
        testHelper.setupTestDefaults( pageDesigner );
      });

      it( 'initializes all sub WebBits of this webBit', function( done ){
        this.webBit.initialize( function( err, webBit ){
          should.not.exist(err);
          webBit.webBits.should.have.lengthOf(5);
          webBit.webBits[0].should.be.instanceof( WebBit );
          done();
        });
      });

    });


  });

})