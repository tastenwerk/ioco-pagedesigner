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
    webPageUrlData: null,
    fallbackLang: 'en'
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
   * @param {Object} [options]
   * * lang: the default language to be selected
   * for nested web bits and meta information
   * * fallbackLang: the language to fallback if
   * the requestet language was not found. Otherwise throws an error
   * * revision: the revision to be used. If none provided or none
   * available, no revision will be used
   *
   */
  pageDesigner.WebBit = function WebBit( attrs, options ){

    options = options || {};

    Object.defineProperty( this, "renderedContent", { value: '', writable: true });
    Object.defineProperty( this, "webBits", { value: [], writable: true });
    Object.defineProperty( this, "revision", { value: options.revision || '', configurable: true });
    Object.defineProperty( this, "lang", { value: options.lang, configurable: true });
    Object.defineProperty( this, "fallbackLang", {
      value: options.fallbackLang || pageDesigner.options.fallbackLang,
      configurable: true
    });
    Object.defineProperty( this, "rolledOutLang", { value: null, configurable: true });

    if( !attrs || !attrs.pluginName )
      throw new Error('a pluginName key must be present in order to create a WebBit');

    if( !pageDesigner.getPluginByName( attrs.pluginName ) )
      throw new Error('pluginName not found in _plugins registry (' + attrs.pluginName + ')');

    if( !attrs || !attrs.name )
      throw new Error('a name key must be present in order to create a WebBit');

    for( var i in attrs ){
      this[i] = attrs[i];
      if( i === 'content' )
        this.setLang( options.lang || this.fallbackLang, { fallbackLang: this.fallbackLang } );
    }

  };

  /**
   * sets the language of the renderedContent object to the given parameters
   *
   * this only works, if the content is not a string, but an object with
   * language codes as keys and with the language defined
   *
   * @param {String} [lang] - the language to search for in the content object
   * @param {object} [options] - the language to fall back if lang is not present in content
   *
   * options has keys:
   * * fallbackLang - the fallback language to use
   * * force - forces the requested lang key to be created. If no language support has been enabled
   *   until now, it will be created.
   *
   */
  pageDesigner.WebBit.prototype.setLang = function setWebBitLang( lang, options ){
    Object.defineProperty( this, "lang", { value: lang });
    Object.defineProperty( this, "fallbackLang", { 
      value: options && options.fallbackLang ? options.fallbackLang : pageDesigner.options.fallbackLang 
    });

    // force
    if( options && options.force ){
      for( var i in this.webBits )
        this.webBits[i].setLang( this.lang, options );
      if( typeof(this.content) === 'object' && Object.keys(this.content).length > 0 )
        this.content[this.lang] = this.content[this.lang] || this.content[this.fallbackLang] || this.content[Object.keys(this.content)[0]];
      else{
        var tmpContent = this.content;
        this.content = {};
        this.content[ this.lang ] = typeof(tmpContent) === 'string' ? tmpContent : '';
      }
      Object.defineProperty( this, "rolledOutLang", { value: this.lang });
      return this.renderedContent = this.content[this.lang];
    }

    if( this.content && typeof(this.content) === 'object' ){
      if( this.content[this.lang] ){
        this.renderedContent = this.content[this.lang];
        Object.defineProperty( this, "rolledOutLang", { value: this.lang });
      } else if( this.content[this.fallbackLang] ){
        this.renderedContent = this.content[this.fallbackLang];
        Object.defineProperty( this, "rolledOutLang", { value: this.fallbackLang });
      }
    } else if( this.content && typeof(this.content) === 'string' ){
      this.renderedContent = this.content;
      Object.defineProperty( this, "rolledOutLang", { value: null });
    }
    if( this.webBits && this.webBits.length > 0 )
      for( var i in this.webBits )
        this.webBits[i].setLang( this.lang, this.fallbackLang );
  }

  /**
   * switch to the revision to use for current
   * WebBit
   *
   * @param {String} [id] - the revision id to be switched to
   *
   */
  pageDesigner.WebBit.prototype.switchRevision = function switchRevisionForWebBit( id ){
    if( this.content && typeof( this.content ) !== 'object' )
      throw new Error('WebBit '+this.name+' is not under revision control');
    if( !this.content[id] )
      throw new Error('WebBit '+this.name+' does not appear to have revision '+id);
    Object.defineProperty( this, "revision", { value: id });
    this.renderedContent = this.content;
  }

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
   * setContent
   *
   * set the content for this webbit. This will override
   * the renderedContent attribute and create a clean
   * content string (tidied up from other WebBit content pollution)
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
  pageDesigner.WebBit.prototype.setContent = function setContentOfWebBit( val ){
    // TODO: update the content attribute
    // cleanup from tidied html code bits
    var $procContent = pageDesigner.$('<div>'+val+'</div>');
    var self = this;
    this.renderedContent = val;
    $procContent.find('[data-web-bit-id]').each(function(){
      self.webBits.push( pageDesigner.$(this).html('') );
    });
    if( typeof(this.content) === 'string' )
      return this.content = $procContent.html();
    if( typeof(this.content) === 'object' ){
      if( this.content.revisions && typeof(this.content.revisions) === 'object' ){
        this.content.revisions[ Object.keys( this.content.revisions ).length ] = {
          'createdAt': new Date(),
          'createdBy': this.currentAuthor,
          'content': $procContent.html()
        };
      }
    }
  };

  /**
   * read content property, reload all webbits and get a new
   * html format of this webbit
   */
  pageDesigner.WebBit.prototype.render = function renderWebBit(){
    var $procContent = pageDesigner.$(this.renderedContent);
    var tmpWebBits = {};
    for( var i in this.webBits )
      tmpWebBits[this.webBits[i]._id] = this.webBits[i];

    $procContent.find('[data-web-bit-id]').each(function(){
      var id = pageDesigner.$(this).attr('data-web-bit-id');
      if( tmpWebBits[id] )
        pageDesigner.$(this).html( tmpWebBits[id].render() );
      else
        this.html('ERROR: WebBit ' + this.attr('data-web-bit-name') + ' not found');
    });
    return $procContent.html();
  }

  /**
   * initialize (prototype for WebBit)
   *
   * initializes all associated WebBits and applies styles
   *
   */
  pageDesigner.WebBit.prototype.initialize = function initializeWebBit( callback ){
    if( !this.content || this.content.length < 2 )
      return;
    if( typeof(callback) !== 'function' )
      throw new Error('a callback function is required for WebBit.initialize');
    var self = this;
    self.webBits = [];
    var $procContent = pageDesigner.$(self.content);

    var webBitIds = [];
    $procContent.find('[data-web-bit-id]').each(function(){
      webBitIds.push( pageDesigner.$(this).attr('data-web-bit-id') );
    });

    var initialized = 0
      , errors = 0;

    function initNextWebBit(){
      if( webBitIds.length === 0 || initialized > webBitIds.length - 1 )
        return callback( (errors > 0 && errors + ' WebBits could not be initialized in ' + self.name || null), self );
        pageDesigner.WebBit.loadById( webBitIds[initialized], function( err, webBit ){
          initialized++;
          if( webBit ){
            self.webBits.push( webBit );
            webBit.initialize( initNextWebBit );
          } else{
            initNextWebBit();
            errors++;
          }
        });
    }

    initNextWebBit();

  };

  /**
   * define WebPage model. A WebPage is the top most root
   * component holding nested WebBits.
   *
   * @param {Object} [attrs] attributes to be set for this WebPage
   *
   * @param {Object} [options]
   * * lang: the default language to be selected
   * for nested web bits and meta information
   * * fallbackLang: the language to fallback if
   * the requestet language was not found. Otherwise throws an error
   * * revision: the revision to be used. If none provided or none
   * available, no revision will be used
   *
   */
  pageDesigner.WebPage = function WebPage( attrs, options ){

    options = options || {};

    if( !attrs || !attrs.name )
      throw new Error('a name key must be present in order to create a WebBit');

    Object.defineProperty( this, "rootWebBit", { value: {}, writable: true });
    Object.defineProperty( this, "revision", { value: options.revision, configurable: true });
    Object.defineProperty( this, "lang", { value: options.lang, configurable: true });
    Object.defineProperty( this, "fallbackLang", {
      value: options.fallbackLang || pageDesigner.options.fallbackLang,
      configurable: true
    });

    for( var i in attrs )
      this[i] = attrs[i];

    this.setLang( options.lang || this.fallbackLang );

  };

  /**
   * initialize this WebPage by calling
   * rootWebBit's initialize method
   * and recursively initialize all associated WebBits
   *
   */
  pageDesigner.WebPage.prototype.initialize = function initializeWebPage( callback ){
    var self = this;
    if( this.rootWebBitId )
      pageDesigner.WebBit.loadById( this.rootWebBitId, function( err, webBit ){ 
        if( webBit ){
          self.rootWebBit = webBit;
          self.rootWebBit.initialize( function( err, webBit ){ callback( err, self ); } );
        } else
          callback( err, self ); 
      });
    else
      throw new Error( 'no rootWebBit found' );
  };

  /**
   * set the language of this webpage and all it's webbits
   *
   */
  pageDesigner.WebPage.prototype.setLang = function setWebPageLang( lang, options ){

    Object.defineProperty( this, "lang", { value: lang });
    Object.defineProperty( this, "fallbackLang", { 
      value: options && options.fallbackLang ? options.fallbackLang : pageDesigner.options.fallbackLang 
    });

    if( this.rootWebBit && this.rootWebBit instanceof pageDesigner.WebBit ){
      this.rootWebBit.setLang( lang, options );
    }
  }

  /**
   * set the root WebBit for this WebPage
   *
   * @param {object|string} [webBit] - the WebBit to be made root or it's id
   *
   */
  pageDesigner.WebPage.prototype.setRootWebBit = function setRootWebBit( webBit, callback ){
    var self = this;
    if( typeof( webBit ) === 'object' && webBit instanceof pageDesigner.WebBit )
      this.rootWebBitId = webBit._id;
    else if( typeof( webBit ) === 'string' )
      this.rootWebBitId = webBit;
    else
      throw new Error('webBit needs to be an instance of WebBit or String (given: ' + typeof(webBit) + ')');
    this.initialize( callback );
  };

  // expose pageDesigner to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs

    // provide a jquery parser to pageDesigner. This is required
    // in order to use the same parsing function as in the browser
    // on server side.
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