var fs = require('fs');

var pageDesigner = require(__dirname+'/../public/javascripts/ioco.page-designer')
  , WebBit = pageDesigner.WebBit
  , WebPage = pageDesigner.WebPage;

var dummyPath = '/../public/demo/dummy/';

pageDesigner.options.debug = 0;

module.exports = exports = {

  load: function( type, id, done ){

    if( !pageDesigner.getPluginByName('empty-container') )
      pageDesigner.addPlugin( require(__dirname+'/../public/javascripts/ioco/pageDesigner/plugins/empty-container') );
    if( !pageDesigner.getPluginByName('text-editor') )
      pageDesigner.addPlugin( require(__dirname+'/../public/javascripts/ioco/pageDesigner/plugins/text-editor') );
    
    var route = type === 'WebBit' ? 'webbits' : 'webpages';
    var self = this;

    fs.readFile( __dirname+dummyPath+route+'/'+id+'.json', function( err, jsonStr ){
      if( type === 'WebBit' ){
        self.webBitJSON = JSON.parse(jsonStr);
        self.webBit = new WebBit( self.webBitJSON );
      } else {
        self.webPageJSON = JSON.parse(jsonStr);
        self.webPage = new WebPage( JSON.parse(jsonStr) );
      }
      done();
    });

  },

  setupTestDefaults: function(pD){
    pD.WebBit.loadById = this._overrideWebBitLoadById;
    pD.WebPage.loadById = this._overrideWebPageLoadById;
  },

  _overrideWebBitLoadById: function( id, options, callback ){
    if( typeof( callback ) === 'undefined' ){
      callback = options;
      options = {};
    }
    var self = this; // WebBit
    var url = __dirname+dummyPath+'webbits'+'/'+id+'.json';
    fs.readFile( url, function( err, jsonStr ){
      callback( null, new self( JSON.parse(jsonStr), options.lang, options.fallbackLang ) );
    });
  },

  _overrideWebPageLoadById: function( id, options, callback ){
    if( typeof( callback ) === 'undefined' ){
      callback = options;
      options = {};
    }
    var self = this; // WebPage
    var url = __dirname+dummyPath+'webpages'+'/'+id+'.json';
    fs.readFile( url, function( err, jsonStr ){
      callback( null, new self( JSON.parse(jsonStr), options.lang, options.fallbackLang ) );
    });
  }

}