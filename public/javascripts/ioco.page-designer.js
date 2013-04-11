/**
 * iocoPageDesigner
 * extensive page designer
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  var root = this;

  var pageDesigner = {};

  pageDesigner.$ = jQuery;

  pageDesigner.options = {
    webBitUrl: '/webbits',
    webPageUrl: '/webpages',
    addUrlData: { _csrf: ioco._csrf || null },
    i18n: false,
    defaultLang: null,
    fallbackLang: 'en',
    revisions: false,
    debug: 3 // 0 ... no debug at all
             // 1 ... errors on console.log
             // 2 ... warnings on console.log
             // 3 ... info on console.log
  };

  /**
   * internal variable. Holds all plugins
   * in an array
   *
   * @api private
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
   * register a plugin
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
   *
   * @returns itself
   * @api public
   *
   */
  pageDesigner.registerPlugin = function registerPlugin( plugin ){
    if( typeof(plugin) === 'string' )
      ioco.require( 'page-designer.'+plugin );
    else if( typeof(plugin) === 'object' ){
      if( this.getPluginByName( plugin.name ) )
        throw new Error('a plugin with name ' + plugin.name + ' already exists');
      this._plugins.push( plugin );
    }
    return this;
  }

  /**
   * translates given value (by processing with given translation plugin)
   * default: pass value plain through function
   *
   * @param {String} [val] - the value string to be translated
   *
   */
  pageDesigner.t = pageDesigner.translate = function translate( val, keys ){
    if( this.options.i18n )
      return $.i18n.t( val, keys );
    return val;
  }

  root.ioco.pageDesigner = pageDesigner;

})();