var should = require('should')

var pageDesigner = require(__dirname+'/../public/javascripts/ioco.page-designer');

describe('ioco.pageDesigner', function(){

  describe('plugin eco system', function(){

    it( 'is an object', function(){
      pageDesigner.should.be.a('object');
    })

    it( 'has _plugins key', function(){
      pageDesigner.should.have.property('_plugins');
    })

    describe('#registerPlugin', function(){
      it( 'sets a plugin', function(){
        pageDesigner.registerPlugin( { name: 'this' } );
        pageDesigner._plugins.should.have.lengthOf(1);
      })

      it( 'a plugin must have a name', function(){
        (function(){ pageDesigner.registerPlugin({ name: 'this' }); }).should.throw(/already exists/);
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