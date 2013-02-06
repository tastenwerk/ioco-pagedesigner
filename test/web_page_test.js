var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/iokit.page-designer');

describe('iokit.pageDesigner', function(){

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
        })

      });

      describe( 'string - lang', function(){

        it( 'takes an optional parameter defining the language this webbit should be initialized with', function(){
          var webPage = new WebPage( { name: 'first' }, 'de' );
          webPage.should.have.property('lang');
        })

        it( 'will fallback to given fallbackLang if passed in as 3rd parameter', function(){
          var webPage = new WebPage( { name: 'first' }, 'de', 'en' );
          webPage.should.have.property('lang');
          webPage.should.have.property('fallbackLang');
        })

      })

    });
  });

})