var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/ioco.page-designer')
  , testHelper = require(__dirname+'/page-designer_test_helper');

describe('ioco.pageDesigner', function(){

  describe('WebPage', function(){
    
    var WebPage = pageDesigner.WebPage;

    it( 'is the root representational object', function(){
      WebPage.should.be.a('function');
    });

    describe( 'attributes parameter', function(){

      describe( 'object - attrs', function(){

        it( 'takes an object with attributes as parameter', function(){
          var webPage = new WebPage( { name: 'first' });
          webPage.should.have.property('name');
        });

        it( 'requires at least a name given', function(){
          (function(){ new WebPage({}) }).should.throw( /name key must be present/ );
        });

      });

      describe( 'string - lang', function(){

        it( 'takes an optional parameter defining the language this webbit should be initialized with', function(){
          var webPage = new WebPage( { name: 'first' }, 'de' );
          webPage.should.have.property('lang');
        });

        it( 'will fallback to given fallbackLang if passed in as 3rd parameter', function(){
          var webPage = new WebPage( { name: 'first' }, 'de', 'en' );
          webPage.should.have.property('lang');
          webPage.should.have.property('fallbackLang');
        });

      })

    });

    describe( '#initialize', function( e ){

      before( function( done ){
        testHelper.setupTestDefaults( pageDesigner );
        testHelper.load.call(this, 'WebPage', 'wp0', done );
      });

      it( 'creates a full html view with all WebBits\' content', function( done ){
        this.webPage.initialize( function( err, webPage ){
          should.not.exist(err);
          webPage.rootWebBit.should.be.instanceOf( pageDesigner.WebBit );
          webPage.rootWebBit.webBits.should.be.lengthOf( 5 );
          webPage.rootWebBit.webBits[1].webBits[0].content.should.match(/tower/);
          done();
        });
      });

    });


    describe( '#setRootWebBit', function(){

      before( function( done ){
        var self = this;
        testHelper.load.call(self, 'WebPage', 'wp0', function(){
          testHelper.load.call(self, 'WebBit', 'wb0', done);
        });
      });

      it( 'sets a string id of a WebBit as rootWebBit for this webPage', function(done){
        this.webPage.setRootWebBit( 'wb0', function( err, webPage ){
          webPage.should.be.instanceOf( pageDesigner.WebPage );
          webPage.rootWebBit.should.be.instanceOf( pageDesigner.WebBit );
          webPage.rootWebBit._id.should.eql('wb0');
          done();
        });
      });

      it( 'sets a WebBit as the rootWebBit for this webPage', function( done ){
        var self = this;
        this.webPage.setRootWebBit( this.webBit, function( err, webPage ){
          webPage.should.be.instanceOf( pageDesigner.WebPage );
          webPage.rootWebBit.should.be.instanceOf( pageDesigner.WebBit );
          webPage.rootWebBit._id.should.eql( self.webBit._id );
          done();
        });
      });

      it( 'initializes all WebBits of the newly set WebBit', function( done ){
        this.webPage.setRootWebBit( 'wb0', function( err, webPage ){
          webPage.rootWebBit.should.be.instanceOf( pageDesigner.WebBit );
          webPage.rootWebBit.webBits.should.be.lengthOf( 5 );
          webPage.rootWebBit.webBits[1].webBits[0].content.should.match(/tower/);
          done();
        })
      });

    });

    describe('#setLang', function(){

      before( function( done ){
        var self = this;
        testHelper.setupTestDefaults( pageDesigner );
        pageDesigner.WebPage.loadById( 'wp_i18n0', function( err, webPage ){
          self.webPage = webPage;
          webPage.initialize( done );
        })
      });

      it( 'by default no fallbackLang is set to "en"', function(){
        this.webPage.fallbackLang.should.eql( pageDesigner.options.fallbackLang )
      });

      it( 'by default loads all associated webBits with fallbackLang', function(){
        this.webPage.rootWebBit.should.be.instanceOf( pageDesigner.WebBit );
        this.webPage.rootWebBit.webBits.should.be.lengthOf(2);
        this.webPage.lang.should.eql('en');
        this.webPage.rootWebBit.lang.should.eql('en');
        this.webPage.rootWebBit.webBits[0].renderedContent.should.match(/Succession/);
        this.webPage.rootWebBit.webBits[1].renderedContent.should.match(/his brother Edward/);
      });

      it( 'sets a language for this webbit and invokes all associated loaded WebBits to switch their language', function(){
        this.webPage.setLang('de');
        this.webPage.lang.should.eql('de');
        this.webPage.rootWebBit.lang.should.eql('de');
        this.webPage.rootWebBit.webBits[0].lang.should.eql('de');
        this.webPage.rootWebBit.webBits[1].lang.should.eql('de');
        this.webPage.rootWebBit.webBits[0].renderedContent.should.match(/Erben/);
        this.webPage.rootWebBit.webBits[1].renderedContent.should.match(/his brother Edward/);
      });

      it( 'WebBits without matching language will use fallbackLang', function(){
        this.webPage.setLang('de');
        this.webPage.rootWebBit.webBits[0].content.should.have.property('en');
        this.webPage.rootWebBit.webBits[1].content.should.not.have.property('de');
        this.webPage.rootWebBit.webBits[1].renderedContent.should.match(/his brother Edward/);
      });
      
    });

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
        this.webPage.setLang('de', { force: true });
        this.webPage.lang.should.eql('de');
        this.webPage.rootWebBit.lang.should.eql('de');
        this.webPage.rootWebBit.content.should.have.property('de');
        this.webPage.rootWebBit.webBits[1].renderedContent.should.match(/his brother Edward/);
      });
      

    });

  });

})