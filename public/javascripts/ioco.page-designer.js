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


  ioco.require('3rdparty/kendo.core.min');
  ioco.require('3rdparty/kendo.data.min');

  var root = this;

  var pageDesigner = {};

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
   *
   * @returns itself
   * @api public
   *
   */
  pageDesigner.registerPlugin = function registerPlugin( plugin, callback ){
    if( plugin && typeof(plugin) === 'string' ){
      if( isNode ){
        if( typeof( callback ) === 'function' )
          callback( 'not supported in nodejs yet' );
        else
          return 'not supported in nodejs yet';
      } else {
        $.getScript( plugin, function(){
            if( typeof(callback) === 'function' )
              callback( null );
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