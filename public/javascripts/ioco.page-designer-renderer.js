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

  PageDesignerRenderer = function(){};

  /**
   * render html
   *
   * Example:
   *
   *     <PageDesignerRendereInheritedInstance>.render();
   *
   * @param {String} view - the view to use for rendering (if no view is given, 'default' will be used)
   * @param {String} lang - the language to use for rendering. see [Webpage] for more informations about language fallback system. If no lang is given, ioco.pageDesigner.options.defaultLang or 'default' will be used
   *
   * @api public
   */
  PageDesignerRenderer.prototype.render = function render( options ){
    options = options || {};
    rev = options.revision || this._currentRevision;
    var _view = this.revisions[rev].views.default
      , _lang = ioco.pageDesigner.defaultLang || 'default'
      , content;
    if( options.view in _view )
      _view = view;
    if( options.lang in _view.content )
      _lang = lang;

    this.renderStyles( this.revisions[rev] );
    return '<div class="ioco-webpage '+this.applyStyles(this.revisions[rev],'classes')+'"'+
      ' data-ioco-id="'+this._id+'"'+
      ' data-ioco-uid="'+this.viewModel().uid+'">'+_view.content[_lang]+
      '</div>';
  };

  /**
   * render styles
   *
   * @param {revision} - the revision to use
   *
   * @api private
   */
  PageDesignerRenderer.prototype.renderStyles = function renderStyles( rev ){
    console.log('rendering styles', rev.config.styles);
    var self = this;
    ioco.pageDesigner.$('head').find('style[data-ioco-id='+this._id+']').remove();
    var css = rev.config.styles;
    var cssLines = css.match(/^[#.]{1}[ \w.#]+{/);
    if( cssLines && cssLines.length > 0 )
      cssLines.forEach( function( m ){
        css = css.replace( m, '[data-ioco-id='+self._id+'] '+m );
      });
    css = css.replace(' #this','');
    ioco.pageDesigner.$('head').append( $('<style/>').attr('data-ioco-id', this._id).html( css ) );
  };

  /**
   * apply styles
   *
   * @param {Object} revision
   * @param {String} key (classes, cssId, styles, ...)
   *
   * @returns {String} css classes
   *
   * @api private
   */
  PageDesignerRenderer.prototype.applyStyles = function applyStyles( revision, key ){
    return revision.config[key];
  }

  /**
   * renders the webpage again without storing updates to the
   * object
   *
   * @param {String} key (what should be updated)
   * @param {String} value
   * @param {String} revision (optional)
   *
   * @api public
   */
  PageDesignerRenderer.prototype.preview = function preview( key, value, revision ){
    var rev = revision || this._currentRevision;
    var cachedVal = eval('this.revisions.'+rev+'.'+key);
    eval('this.revisions.'+rev+'.'+key+' = value');
    this.render({ revision: rev });
    eval('this.revisions.'+rev+'.'+key+' = cachedVal');
  }

  root.ioco.PageDesignerRenderer = PageDesignerRenderer;

})();