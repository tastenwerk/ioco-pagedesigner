/**
 * ioco.Webbit
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  var root = this;

  /**
   * Construct a Webbit
   *
   * Examples:
   *
   *     ioco.Webbit({ name: 'testbit' });
   *     // => a webbit object
   *
   * A webbit typically is a block of code wrapped in a
   * div.
   *
   * required attributes:
   * * pluginName: the name of the plugin this webbit is initialized with
   * * name: the name of the webbit. There can't be a webbit without a name
   *
   * =Structure of a webbit
   * 
   * ==views
   * An object consisting of keys like 'default', 'mobile' to define the
   * available view modes of the webbit. This is requested in the [render]
   * method.
   *
   * ===includes
   * An object with child webbitIds as key and a setting object as their value.
   * the setting object can have the following values:
   * * classes: css classes to be set for this webbit's resulting div within this view
   * * styles: css styles to match for this webbit's resulting div
   * * cssId: css id to match for this webbit's div
   * * js: javascript code to run when webbit is rendered
   *
   * ===content
   * A content object consisting of the following structure considering
   * the optional use of translated contents:
   *
   * * default: the default language
   * * en: english version
   * * es: spanish version
   *
   * The ioco.pageDesigner.options.fallbackLang property is used when no language
   * of requested is present. If fallbackLang is not provided, 'en' will be used.
   *
   * The content attribute will be omitted if serverSide property of the webbit's plugin
   * is set to true.
   *
   * ==config
   * * classes: css classes to be set for this webbit which are valid in all views
   *   this is e.g. for inner html elements
   * * cssId: css id to match for this webbit by default (the above config in the actual include will override this setting)
   * * classes: css classes to match for this webbit by default (the above config in the actual include will override this setting)
   * * js: javascript (the above config will override this setting)
   *
   * @param {object} attributes to be set for this webbit
   * @api public
   */
  function Webbit( attrs ){
    ioco.log('initializing new Webbit with attrs: ', attrs);
    this._setupDefaultAttrs();
    for( var i in attrs )
      this[i] = attrs[i];

    ioco.PageDesignerRenderer.init.call( this );

  }

  Webbit.prototype.viewModel = function viewModel(){
    return this;
  }

  /**
   * setup default attributes for this webbit
   *
   * @api private
   */
  Webbit.prototype._setupDefaultAttrs = function _setupDefaultAttrs(){
    this.name = null;
    this.revisions = {};
    this.revisions.master = {};
    this.revisions.master.views = {
      default: {
        includes: {},
        content: {
          default: 'no content yet'
        }
      }
    };
    this.revisions.master.config = {
      classes: 'default-span',
      cssId: '',
      styles: '',
      js: ''
    }
  };

  /**
   * render a webbit's html
   *
   * Example:
   *
   *     webbit.render();
   *
   * @param {String} view - the view to use for rendering (if no view is given, 'default' will be used)
   * @param {String} lang - the language to use for rendering. see [Webbit] for more informations about language fallback system. If no lang is given, ioco.pageDesigner.options.defaultLang or 'default' will be used
   * @param {Number} revision - the revision of the webbit ( if none, default will be used )
   *
   * @api public
   */
  Webbit.prototype.render = function renderWebbit( options ){
    options = options || {};
    rev = options.revision || 'master';
    var _view = this.revisions[rev].views.default
      , _lang = ioco.pageDesigner.defaultLang || 'default'
      , content;
    if( options.view in _view )
      _view = view;
    if( options.lang in _view.content )
      _lang = lang;
    return '<div class="ioco-webbit '+this.applyStyles(rev,'classes')+'"'+
      ' data-ioco-uid="'+this.uid+'" id="'+this.applyStyles(rev,'cssId')+'">'+_view.content[_lang]+
      '</div>';
  };


  Webbit.prototype.showStylesEditor = ioco.PageDesignerProperties.showSrcEditor;
  Webbit.prototype.showHtmlEditor = ioco.PageDesignerProperties.showSrcEditor;

  /**
   * get webbit's styles
   *
   * @param {String} revision
   * @param {String} key (classes, cssId, styles, ...)
   *
   * @returns {String} css classes
   *
   * @api private
   */
  Webbit.prototype.applyStyles = function applyStyles( revision, key ){
    var config = this.revisions[revision].config;
    return config[key];
  }


  /**
   * hold current designer (kendo) uid
   *
   * @api public
   */
  Object.defineProperty( Webbit.prototype, 'uid', {
    value: '',
    writable : true,
    configurable : true
  });

  root.ioco.Webbit = Webbit;

})();