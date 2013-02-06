/**
 * ioPageDesigner
 * extensive page designer
 *
 * (c) TASTENWERK 2013
 *
 * web: https://github.com/tastenwerk/iopagedesigner
 *
 */

( function(){

  // establish root object (window in browser, global in nodejs)
  var root = this
    , isNode = false;

  pageDesigner = {};

  /**
   * default options
   *
   */
  pageDesigner.options = {
    webBitUrl: '/web_bits',
    webBitUrlData: null,
    webPageUrl: '/web_pages',
    webPageUrlData: null
  };

  /**
   * _plugins
   *
   * internal variable. Holds all plugins
   * in an array
   */
  pageDesigner._plugins = [];

  /**
   * getPluginByName
   *
   * finds a plugin by given name
   * @param {String} [name] - the name of the plugin which
   * should be found
   *
   * @returns {object} [plugin] the plugin or nothing if not found
   *
   */
  pageDesigner.getPluginByName = function getPluginByName( name ){
    for( var i in this._plugins )
      if( this._plugins[i].name === name )
        return this._plugins[i];
  };

  /**
   * addPlugin
   *
   * adds a plugin to the _plugin system
   *
   * @param {object} [plugin] - the plugin object to 
   * be added
   *
   * a plugin can have the following keys:
   * * name (required)
   * * iconClass (optional) - an icon class defined elsewhere in css
   * * iconImg (optional) - an icon image path
   * * hoverTitle (optional) - text to be shown when hovered
   * * on.activate - function to be called when a WebBit of this plugin type is created
   * * on.init = function to be called when a WebBit of this plugin type is initialized (on load time on creation time)
   * * on.deactivate
   * * on.cleanup
   *
   * @returns itself
   *
   */
  pageDesigner.addPlugin = function addPlugin( plugin, callback ){
    if( plugin && typeof(plugin) === 'string' ){
      if( isNode ){
        if( typeof( callback ) === 'function' )
          callback( 'not supported in nodejs yet' );
        else
          return 'not supported in nodejs yet';
      } else {
        $.ajax({ url: plugin, type: 'get', 
          success: function( pluginStr ){
            if( pluginStr && pluginStr.length > 0 )
              this._plugins.push( eval(pluginStr) );
            if( typeof(callback) === 'function' )
              callback( null );
          },
          error: function( xhr, status, errStr ){
            if( typeof( callback ) === 'function' )
              callback( status + ':' + errStr );
          }
        });
      }
    } else {
      if( !plugin || !plugin.name || plugin.name.length < 3 )
        throw new Error('plugin must have a name key and must be of length 3 at least')
      if( this.getPluginByName( plugin.name ) )
        throw new Error('a plugin with that name already exists');
      this._plugins.push( plugin );
      return this;
    }
  }

  /**
   * observe a given property
   */
  pageDesigner._processObservable = function _privateProcessObservable( property, val ){
    if( val )
      this[property] = val;
    else
      return this[property];
    // invoke jQuery refresh
  }

  /**
   * cleanup given value from
   * dirty web-bit fragments
   */
  pageDesigner._cleanup = function _privateCleanupValue( val ){
    return val;
  }

  /**
   * define WebBit model. A WebBit is
   * the tiniest bit which can be nested
   * and collects a group of other web bits
   *
   * @param {Object} [attrs] attributes to be set for this
   * WebBit
   *
   * @param {String} [lang] the language of the content to be
   * used. If no language is given, the .content property is
   * used. If lang === 'de', the .content.de attribute is used.
   *
   * @param {String} [fallbackLang] the language to fallback if
   * requested language is not found. otherwise throws an error
   *
   */
  pageDesigner.WebBit = function WebBit( attrs, lang, fallbackLang ){

    if( !attrs || !attrs.pluginName )
      throw new Error('a pluginName key must be present in order to create a WebBit');

    if( !pageDesigner.getPluginByName( attrs.pluginName ) )
      throw new Error('pluginName not found in _plugins registry (' + attrs.pluginName + ')');

    if( !attrs || !attrs.name )
      throw new Error('a name key must be present in order to create a WebBit');

    for( var i in attrs ){
      if( i === 'content' ){
        if( lang && lang.length > 0 && typeof( attrs[i] ) === 'object' ){
          if( attrs[i][lang] )
            pageDesigner._processObservable.call( this, 'renderedContent', attrs[i][lang] );
          else if( attrs[i][fallbackLang] )
            pageDesigner._processObservable.call( this, 'renderedContent', attrs[i][fallbackLang] );
          else
            throw new Error('lang key not present ('+lang+')');
        } else
          pageDesigner._processObservable.call( this, 'renderedContent', attrs[i] );
      }
      this[i] = attrs[i];
    }

  };

  /**
   * load a webBit by given id
   * either in browser mode by using json or
   * in server mode by using an external function (passed in by options)
   */
  pageDesigner.WebBit.loadById = function loadWebBitById( id, callback ){
    if( isNode )
      throw new Error('WebBit.loadById in NodeJS mode interface needs to be implemented by overriding this function. See documentation');
    else
      $.ajax({  url: pageDesigner.options.webBitUrl,
                data: pageDesigner.options.webBitUrlData, 
                type: 'get',
                dataType: 'json',
                success: function( json ){
                  // TODO: more error parsing
                  // and feedback!!!
                  callback( null, new pageDesigner.WebBit( json ) );
                }
      })
  }

  /**
   * create non-enumerable observable function
   * to allow properties to be 'observable' attached
   * to the html dom
   */
  Object.defineProperty( pageDesigner.WebBit.prototype, "observable", {
    value: function( property ){
      this[property] = '';
      Object.defineProperty( this, 'set'+property.substr(0,1).toUpperCase()+property.substr(0,property.length-1), {
        value: function( val ){  }
      });
      Object.defineProperty( this, 'get'+property.substr(0,1).toUpperCase()+property.substr(0,property.length-1), {
        value: function( val ){ pageDesigner._processObservable.call( this, property, val ); }
      });
    }
  });

  /**
   *
   * renderedContent
   *
   * create special property
   * renderedContent which is not visible
   * to enumerables
   *
   */
  Object.defineProperty( pageDesigner.WebBit.prototype, "renderedContent", {
    value: '',
    writable: true
  });

  /**
   * 
   * webBits
   *
   * webBits is a temporary property just used
   * for caching mechanisms. It should not be enumerable
   *
   */
  Object.defineProperty( pageDesigner.WebBit.prototype, "webBits", {
    value: [],
    writable: true
  });

  /**
   * cleanup and update content property
   *
   * get a clean html string from this WebBit with all
   * initialized SubWebBits removed. This leaves e.g. one
   * single WebBit inside this WebBit form:
   *
   *     <div class="iokit-web-bit" data-id="<webBitId>">
   *       content of web bit here
   *     </div>
   *
   * into:
   *
   *     <div class="iokit-web-bit" data-id="<webBitId>"></div>
   *
   * and writes it to the content property
   *
   *
   */
  Object.defineProperty( pageDesigner.WebBit.prototype, "cleanup", {
    value: function( val ){
      // TODO: update the content attribute
      // cleanup from tidied html code bits
      this.content = pageDesigner._cleanup(val);

      //pageDesigner._processObservable.call( this, 'renderedContent', val );
    }
  });

  /**
   * read content property, reload all webbits and get a new
   * html format of this webbit
   */
  Object.defineProperty( pageDesigner.WebBit.prototype, "render", {
    value: function(){
      // TODO: format content
      this.renderedContent = this.content;
      return this.renderedContent;
    }
  });

  /**
   * initialize (prototype for WebBit)
   *
   * initializes all associated WebBits and applies styles
   *
   */
  pageDesigner.WebBit.prototype.initialize = function initializeWebBit( callback ){
    if( !this.content || this.content.lenght < 2 )
      return;
    var self = this;
    var $procContent = pageDesigner.$(self.content);

    var webBitIds = [];
    $procContent.find('[data-web-bit-id]').each(function(){
      webBitIds.push( pageDesigner.$(this).attr('data-web-bit-id') );
    });

    var initialized = 0;

    function initNextWebBit(){
      if( webBitIds.length === 0 || initialized > webBitIds.length - 1 )
        return callback( null, self );
      if( self.webBits.length > initialized && self.webBits[initialized]._id && self.webBits[initialized]._id === webBitIds[initialized] ){
        initialized++;
        initNextWebBit();
      } else {
        pageDesigner.WebBit.loadById( webBitIds[initialized], function( err, webBit ){
          if( webBit )
            self.webBits.push( webBit );
          initialized++;
          initNextWebBit();
        });
      }
    }

    initNextWebBit();

  };

  /**
   * define WebPage model. A WebPage is the top most root
   * component holding nested WebBits.
   *
   * @param {Object} [attrs] attributes to be set for this WebPage
   *
   * @param {String} [lang] the default language to be selected
   * for nested web bits and meta information
   *
   * @param {String} [fallbackLang] the language to fallback if
   * the requestet language was not found. Otherwise throws an error
   *
   */
  pageDesigner.WebPage = function WebPage( attrs, lang, fallbackLang ){

    if( !attrs || !attrs.name )
      throw new Error('a name key must be present in order to create a WebBit');

    this.lang = lang || null;
    this.fallbackLang = fallbackLang || null;
    this.rootWebBit = null;

    for( var i in attrs )
      this[i] = attrs[i];

  };

  /**
   * cleanup (prototype for WebPage)
   *
   * recursively instruct WebBits attached to this WebPage to
   * call their cleanup function
   *
   */
  pageDesigner.WebPage.prototype.initialize = function initializeWebPage(){
    if( this.rootWebBit )
      ;//this.rootWebBit.initialize();
  };

  // expose pageDesigner to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs

    // provide a jquery parser to pageDesigner. This is required
    // in order to use the same parsing function as in the browser
    cheerio = require('cheerio');
    pageDesigner.$ = cheerio;
    module.exports = pageDesigner;
    isNode = true;
  } else {
    if( !root.iokit || typeof( root.iokit ) !== 'object' )
      root.iokit = {};
    root.iokit.pageDesigner = pageDesigner;
    pageDesigner.$ = jQuery;
  }

})();