var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/ioco.page-designer')
  , testHelper = require(__dirname+'/page-designer_test_helper');

describe('ioco.pageDesigner', function(){

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

      });

      describe( '@options - lang', function(){

        it( 'takes an optional parameter defining the language this webbit should be initialized with', function(){
          var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: { de: 'de', en: 'en'} }, {lang: 'de'} );
          webBit.renderedContent.should.eql('de');
        });

      });

      describe( '@options - fallbacklang', function(){

        it( 'will fallback to given fallbackLang if passed in as 3rd parameter', function(){
          var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: { en: 'en'} }, {lang: 'de', fallbackLang: 'en'} );
          webBit.renderedContent.should.eql('en');
        });

        it( 'will fallback to default fallbackLang passed to pageDesigner.options.fallbackLang', function(){
          var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: { en: 'en'} } );
          webBit.renderedContent.should.eql('en');
        });

      });

    });

    describe('non-enumerable properties', function(){

      it( '@webBits should not be enumerable', function(){
        var webBit = new WebBit({ name: 'first', pluginName: 'empty' });
        webBit.webBits.should.eql([]);
        ( function(){
          for( var i in webBit )
            if( i === 'webBits' )
              throw new Error('found property');
        }).should.not.throw('found property');
      });

      it( '@renderedContent should not be enumerable', function(){
        var webBit = new WebBit({ name: 'first', pluginName: 'empty' });
        webBit.renderedContent.should.eql('');
        ( function(){
          for( var i in webBit )
            if( i === 'renderedContent' )
              throw new Error('found property');
        }).should.not.throw('found property');
      });

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

    describe('#setLang', function(){

      before( function( done ){
        var self = this;
        testHelper.setupTestDefaults( pageDesigner );
        pageDesigner.WebBit.loadById( 'wb_i18n0', function( err, webBit ){
          self.webBit = webBit;
          webBit.initialize( done );
        })
      });

      it( 'by default loads all associated webBits with fallbackLang', function(){
        this.webBit.webBits.should.be.lengthOf(2);
        this.webBit.lang.should.eql('en');
        this.webBit.webBits[0].lang.should.eql('en');
        this.webBit.webBits[0].renderedContent.should.match(/Succession/);
        this.webBit.webBits[1].renderedContent.should.match(/his brother Edward/);
      });

      it( 'sets a language for this webbit and invokes all associated loaded WebBits to switch their language', function(){
        this.webBit.setLang('de');
        this.webBit.lang.should.eql('de');
        this.webBit.webBits[0].lang.should.eql('de');
        this.webBit.webBits[0].renderedContent.should.match(/Erben/);
        this.webBit.webBits[1].renderedContent.should.match(/his brother Edward/);
      });

      it( 'WebBits without matching language will use fallbackLang', function(){
        this.webBit.setLang('de');
        this.webBit.lang.should.eql('de');
        this.webBit.webBits[1].content.should.have.property('en');
        this.webBit.webBits[1].content.should.not.have.property('de');
        this.webBit.webBits[1].renderedContent.should.match(/his brother Edward/);
      });
      
    });

    describe( '@rolledOutLang returns currently rolledOut language', function(){

      it( 'shows "en" as currently rolledOutLanguage', function(){
        this.webBit.setLang('de');
        this.webBit.webBits[0].rolledOutLang.should.eql('de');
        this.webBit.webBits[1].rolledOutLang.should.eql('en');
      });

    })

    describe( '#setLang with force option', function(){

      before( function( done ){
        var self = this;
        testHelper.setupTestDefaults( pageDesigner );
        pageDesigner.WebBit.loadById( 'wb_i18n0', function( err, webBit ){
          self.webBit = webBit;
          webBit.initialize( done );
        })
      });

      it( 'forces the language to be set to the given lang by creating the lang key in the webBit\'s content', function(){
        this.webBit.setLang('de', { force: true });
        this.webBit.lang.should.eql('de');
        this.webBit.webBits[0].lang.should.eql('de');
        this.webBit.webBits[1].content.should.have.property('de');
        this.webBit.webBits[1].renderedContent.should.match(/his brother Edward/);
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
          webBit.webBits[0].should.be.instanceOf( WebBit );
          done();
        });
      });

      it( 'initializes all nested WebBits recursively', function( done ){
        this.webBit.initialize( function( err, webBit ){
          should.not.exist(err);
          webBit.webBits.should.have.lengthOf(5);
          webBit.webBits[1].webBits.should.be.lengthOf( 1 );
          webBit.webBits[1].webBits[0].content.should.match(/tower/);
          done();
        });
      })

    });

    describe( '#setContent', function(){

      before( function( done ){
        this.content = "<div data-web-bit-root><ul><li>Early Life</li><li>Accession</li><li>Succession</li></ul></div>";
        this.changedRenderedContent = "<ul><li>Early Life</li><li>Accession</li><li>Succession</li><li>Death</li></ul>";
        this.changedContent = "<div data-web-bit-root=\"true\">"+this.changedRenderedContent+"</div>";
        testHelper.load.call(this, 'WebBit', 'wb0', done );
        testHelper.setupTestDefaults( pageDesigner );
      });

      it( 'takes a content and puts its information into the rendereContent (as is) and a cleaned up version into the content property', function( done ){
        var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: this.content });
        var self = this;
        webBit.initialize( function( err, webBit ){
          webBit.setContent(self.changedContent);
          webBit.content.should.eql(self.changedContent);
          done();
        });
      });

      it( 'same action also changes renderedContent attribute to given value', function( done ){
        var webBit = new WebBit( { pluginName: 'empty', name: 'first', content: this.content });
        var self = this;
        webBit.initialize( function( err, webBit ){
          webBit.setContent(self.changedContent);
          webBit.renderedContent.should.eql(self.changedContent);
          done();
        });
      });


      it( 'all html auto-rendered nested WebBits are cleaned out in new content value', function( done ){
        var self = this;
        var orig = "<div data-web-bit-id=\"wb1\" class=\"span3\" data-web-bit-name=\"Main Menu\"></div><div data-web-bit-id=\"wb5\" data-web-bit-name=\"Hero Header\" class=\"span3\"></div><div data-web-bit-id=\"wb2\" data-web-bit-name=\"1 of 3 Columns\" class=\"span1 float-left\"></div><div data-web-bit-id=\"wb3\" data-web-bit-name=\"2 of 3 Columns\" class=\"span1 float-left\"></div><div data-web-bit-id=\"wb4\" data-web-bit-name=\"3 of 3 Columns\" class=\"span1 float-left\"></div>";
        var changed = "<div data-web-bit-id=\"wb1\" data-web-bit-name=\"Main Menu\"></div>";
        this.webBit.content.should.eql(orig);
        this.webBit.initialize( function( err, webBit ){
          webBit.setContent(changed);
          webBit.content.should.eql(changed);
          done();
        });
      });

    });

    describe( '#render', function(){

      before( function( done ){
        this.content = "<div data-web-bit-root='true'><div data-web-bit-id='wb2'></div></div>";
        this.changedContent = "<div data-web-bit-root='true'><h2>He and his brother</h2><div data-web-bit-id='wb2'></div></div>";
        var self = this;
        this.webBit = new WebBit( {pluginName: 'empty', name: 'renderTest', content: this.content } );
        this.webBit.initialize( function( err, webBit ){
          self.innerContent = webBit.webBits[0].content;
          done();
        });
      });

      it( 'renders all nested WebBits (divs) filled with their associated content', function(){
        this.webBit.render().should.match(/young king travelled to London/);
      })

      it( 'renders updated content', function(){
        this.webBit.setContent(this.changedContent);
        this.webBit.render().should.match(/He and his brother\<\/h2\>/);
      })

    })

  });

})