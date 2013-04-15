/**
 * iocoPageDesigner Renderer
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  var root = this;
  var ioco;

  var isNode = (typeof(module) === 'object');

  if( isNode )
    ioco = { pageDesigner: require(__dirname+'/ioco.page-designer') };
  else
    ioco = root.ioco

  PageDesignerRenderer = function(){};

  /**
   * initializes additional object properties
   *
   * @api private
   */
  PageDesignerRenderer.init = function init(){

    for( var i in PageDesignerRenderer.prototype )
      this[i] = PageDesignerRenderer.prototype[i];

    Object.defineProperty( this, 'revision', {
      get: function(){
        return this.revisions[ this._currentRevision ];
      },
      enumerable: true
    });

    Object.defineProperty( this, '_currentRevision', {
      value: 'master',
      writeable: true,
      enumerable: true
    });

    Object.defineProperty( this, '_currentView', {
      value: ioco.pageDesigner.options.defaultView || 'default',
      writeable: true,
      enumerable: true
    });

    Object.defineProperty( this, '_currentLang', {
      value: ioco.pageDesigner.options.defaultLang || 'default',
      writeable: true,
      enumerable: true
    });

    Object.defineProperty( this, 'plugin', {
      get: function(){
        return ioco.pageDesigner.getPluginByName( this.pluginName );
      },
      enumerable: true
    });

    Object.defineProperty( this, 'config', {
      get: function(){
        return this.revision.config;
      },
      enumerable: true
    });

    Object.defineProperty( this, 'view', {
      get: function(){
        return this.revision.views[ this._currentView ];
      },
      enumerable: true
    });

    Object.defineProperty( this, 'lang', {
      get: function(){
        return this.view.content[ this._currentLang ];
      },
      enumerable: true
    });

    Object.defineProperty( this, 'revisionsArray', {
      get: function(){
        return Object.keys( this.revisions );
      },
      enumerable: true
    });
    
    Object.defineProperty( this, 'viewsArray', {
      get: function(){
        return Object.keys( this.revision.views );
      },
      enumerable: true
    });

    Object.defineProperty( this, 'langArray', {
      get: function(){
        return Object.keys( this.view.content );
      },
      enumerable: true
    });

    this.items = this.items || [];
    this.expanded = true;

    /*
     * these functions are required in order to 
     * have them visible in kendo template event calls
     */

    if(!isNode){
      this.showStylesEditor = ioco.PageDesignerProperties.showSrcEditor;
      this.showHtmlEditor = ioco.PageDesignerProperties.showSrcEditor;      
    }

  }

  /**
   * get view object of this webpage or webbit
   *
   * Example:
   *     webbit.getView();
   *     -> {ViewObject}
   *
   *     webpage.getView('mobile');
   *     -> {MobileViewObject}
   *
   * @param {String} - the revision tu use (default: this._currentRevision)
   * @param {String} - the name of the view (default: this._currentView)
   *
   * @returns {Object} - the view object
   *
   * @api public
   */
  PageDesignerRenderer.prototype.getView = function getView( revision, view ){
    return this.getRevision( revision ).views[ view || this._currentView ];
  }

  /**
   * get revision object of this webpage or webbit
   *
   * Example:
   *     webbit.getRevision();
   *     -> {ViewObject}
   *
   *     webpage.getRevision('mobile');
   *     -> {MobileViewObject}
   *
   * @param {String} - the name of the revision (default: this._currentRevision)
   *
   * @returns {Object} - the revision object
   *
   * @api public
   */
  PageDesignerRenderer.prototype.getRevision = function getRevision( rev ){
    return this.revisions[ rev || this._currentRevision ];
  }

  /**
   * get lang object of this webpage or webbit
   *
   * Example:
   *     webbit.getLang();
   *     -> {ViewObject}
   *
   *     webpage.getLang('mobile');
   *     -> {MobileViewObject}
   *
   * @param {String} - the revision tu use (default: this._currentRevision)
   * @param {String} - the view tu use (default: this._currentView)
   * @param {String} - the name of the lang (default: this._currentLang)
   *
   * @returns {Object} - the lang object
   *
   * @api public
   */
  PageDesignerRenderer.prototype.getLang = function getLang( rev, view, lang ){
    return this.getView( rev, view ).content [ lang || this._currentLang ];
  }

  /**
   * render html
   *
   * Example:
   *
   *     <PageDesignerRendereInheritedInstance>.render();
   *
   * @param {object} options
   *  * {String} revision - the revision to use
   *  * {String} view - the view to use for rendering (if no view is given, 'default' will be used)
   *  * {String} lang - the language to use for rendering. see [Webpage] for more informations about language fallback system. If no lang is given, ioco.pageDesigner.options.defaultLang or 'default' will be used
   *
   * @api public
   */
  PageDesignerRenderer.prototype.render = function render( options ){
    options = options || {};
    if( !isNode )
      this.renderStyles( this.getRevision( options.revision ) );

    var self = this;
    var $content = ioco.pageDesigner.$('<div class="ioco-'+(this._type === 'Webpage' ? 'webpage' : 'webbit')+' '+this.getRevision( options.revision ).config.classes+'"'+
      ' data-ioco-id="'+this._id+'"'+
      ' data-ioco-uid="'+this.uid+'" />').append(this.getLang( options.lang ));

    $content.find('[data-ioco-id]').each( function(){
      var id = ioco.pageDesigner.$(this).attr('data-ioco-id');
      var child;
      console.log( self.items, id );
      self.items.forEach( function( item ){
        if( item._id.toString() === id )
          child = item;
      });
      if( !isNode )
        child.builder = self.builder;
      if( isNode )
        child = new ioco.Webbit( child );
      console.log('child', child );
      ioco.pageDesigner.$(this).replaceWith( self.builder.decorate( child.render() ) );
    });
    if( isNode ){
      $content.find('[data-ioco-id]').each( function(){ this.attr('data-ioco-id',null); });
      $content.find('[data-ioco-uid]').each( function(){ this.attr('data-ioco-uid',null); });
      $content.attr('data-ioco-id',null).attr('data-ioco-uid',null);
      if( this._scriptedContent )
        $content.html( this._scriptedContent);
    }
    
    return $content;
  };

  /**
   * render styles
   *
   * @param {revision} - the revision to use
   *
   * @api private
   */
  PageDesignerRenderer.prototype.renderStyles = function renderStyles( rev ){
    var self = this;
    ioco.pageDesigner.$('head').find('style[data-ioco-id='+this._id+']').remove();
    var css = rev.config.styles;
    if( !css )
      return;
    var cssLines = css.match(/^[#.]{1}[ \w.#]+{/);
    if( cssLines && cssLines.length > 0 )
      cssLines.forEach( function( m ){
        css = css.replace( m, '[data-ioco-id="'+self._id+'"] '+m );
      });
    css = css.replace(' #this','');
    var resCss = '<style data-ioco-id="'+this._id+'">'+css+'</style>';
    setTimeout( function(){ $('head').append( resCss ); }, 5 );
  };

  /**
   * renders the webpage again without storing updates to the
   * object
   *
   * @param {String} key (what should be updated)
   * @param {String} value
   *
   * @param {Object} options
   *  * revision
   *  * view
   *  * lang
   *
   * @api public
   */
  PageDesignerRenderer.prototype.preview = function preview( key, value, options ){
    options = options || {};
    if( key === 'content' )
      return this.setContent( value, options );
    var cachedVal = eval('this.getRevision(options.revision).'+key);
    this.update( key, value, options );
    //eval('this.revisions.'+revision+'.'+key+' = value');
    this.builder.update( this, options );
    //eval('this.revisions.'+revision+'.'+key+' = cachedVal');
    this.update( key, cachedVal, options );
  }

  /**
   * updateRender
   *
   * calls a render event updating the current view
   * with current values
   * this is used from kendo bind events
   *
   * @api private
   */
  PageDesignerRenderer.prototype.updateRender = function updateRender(){
    this.builder.update( this );
  }

  /**
   * updates the given values of the component
   *
   * @param {String} key (what should be updated)
   * @param {String} value
   * @param {object} options
   *  * revision
   *  * view
   *  * lang
   *
   * @api public
   */
  PageDesignerRenderer.prototype.update = function update( key, value, options ){
    options = options || {};
    try{
      eval('this.revisions[(options.revision || this._currentRevision)].'+key+' = value');
    }catch(e){ console.log(e);}
  }

  /**
   * sets the given content to the current or given
   * view
   *
   * @param {String} the value to set
   * @param {object} options
   *  * revision
   *  * view
   *  * lang
   *  * store (stores the value, otherwise render will be called with new value but value will be dismissed afterwards)
   *
   * @api public
   */
  PageDesignerRenderer.prototype.setContent = function setContent( value, options ){
    options = options || {};
    var revision = options.revision || this._currentRevision;
    var view = options.view || this._currentView;
    var lang = options.lang || this._currentLang;
    var cachedVal = this.lang; //getLang( revision, view, lang );
    this.revisions[revision].views[view].content[lang] = value;
    console.log(this.builder);
    if( !isNode )
      this.builder.update( this, options );
    if( options.store && options.store === false )
      this.revisions[revision].views[view].content[lang] = cachedVal;
  }

  if( isNode ){

    /**
     * override builder with real builder
     * in nodejs we keep this as we do not want to build anything around the
     * actual content
     */
    PageDesignerRenderer.prototype.builder = {
      decorate: function( content ){
        return content;
      }
    }
    var ioco = { Webbit: require( __dirname + '/ioco.webbit' ), pageDesigner: { options: {}, $: require('cheerio') } };

    module.exports = exports = PageDesignerRenderer;

  }
  else
    root.ioco.PageDesignerRenderer = PageDesignerRenderer;

})();