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
    this._id = (new Date).getTime().toString(36); // TODO: remove this when using a real db
    this.revisions = {};
    this.revisions.master = {};
    this.revisions.master.views = {
      default: {
        includes: {},
        content: {
          default: '<h1>no content yet</h1>'
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


  Webbit.prototype.showStylesEditor = ioco.PageDesignerProperties.showSrcEditor;
  Webbit.prototype.showHtmlEditor = ioco.PageDesignerProperties.showSrcEditor;

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