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
  pageDesigner.addPlugin = function addPlugin( plugin ){
    if( !plugin || !plugin.name || plugin.name.length < 3 )
      throw new Error('plugin must have a name key and must be of length 3 at least')
    if( this.getPluginByName( plugin.name ) )
      throw new Error('a plugin with that name already exists');
    this._plugins.push( plugin );
    return this;
  }

  /**
   * define WebBit model. A WebBit is
   * the only and overall bit which is
   * nested and collects a group of other web bits
   *
   * even a full WebPage (the top most root) is a WebBit
   *
   * @param {object} [attrs] attributes to be set for this
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

    this._renderedContent = '';
    for( var i in attrs ){
      if( i === 'content' ){
        if( lang && lang.length > 0 && typeof( attrs[i] ) === 'object' ){
          if( attrs[i][lang] )
            this._renderedContent = attrs[i][lang];
          else if( attrs[i][fallbackLang] )
            this._renderedContent = attrs[i][fallbackLang];
          else
            throw new Error('lang key not present ('+lang+')');
        } else
          this._renderedContent = attrs[i];
      }
      this[i] = attrs[i];
    }
  };

  /**
   * cleanup (prototype for WebBit)
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
   */
  pageDesigner.WebBit.prototype.cleanup = function cleanupWebBit(){
    if( !this._content || !this._content.length )
      return;
  }

  /**
   * initialize (prototype for WebBit)
   *
   * initializes this WebBits _content. This loads all inner
   * WebBits recursively.
   */
  pageDesigner.WebBit.prototype.initialize = function initializeWebBit(){
    if( !this._content || !this._content.length )
      return;

  }

  // expose pageDesigner to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs

    // provide a jquery parser to pageDesigner. This is required
    // in order to use the same parsing function as in the browser
    cheerio = require('cheerio');
    pageDesigner.$ = cheerio.load;
    module.exports = pageDesigner;
    isNode = true;
  } else {
    if( !root.iokit || typeof( root.iokit ) !== 'object' )
      root.iokit = {};
    root.iokit.pageDesigner = pageDesigner;
  }

})();