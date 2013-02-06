var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/iokit.page-designer');

describe('iokit.pageDesigner', function(){

  describe('plugin eco system', function(){

    it( 'is an object', function(){
      pageDesigner.should.be.a('object');
    })

    it( 'has _plugins key', function(){
      pageDesigner.should.have.property('_plugins');
    })

    describe('#addPlugin', function(){
      it( 'sets a plugin', function(){
        pageDesigner.addPlugin( { name: 'this' } );
        pageDesigner._plugins.should.have.lengthOf(1);
      })

      it( 'a plugin must have a name', function(){
        (function(){ pageDesigner.addPlugin(); }).should.throw(/must have a name/);
      })

      it( 'a plugin must have a name', function(){
        (function(){ pageDesigner.addPlugin({}); }).should.throw(/must have a name/);
      })

      it( 'a plugin must have a name', function(){
        (function(){ pageDesigner.addPlugin({ name: 'this' }); }).should.throw(/already exists/);
      })

      it( 'takes a urlString for the plugin as well', function( done ){
        pageDesigner.addPlugin( '/myurl', function( err ){
          err.should.match(/not supported/);
          done();
        });
      })

    });

    describe('#getPluginByName', function(){

      it( 'finds the plugin previously defined', function(){
        pageDesigner.getPluginByName( 'this' ).should.have.property('name');
        pageDesigner.getPluginByName( 'this' ).name.should.eql('this');
      })

    });

  });

})