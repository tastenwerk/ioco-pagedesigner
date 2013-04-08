/**
 * ioco.Webpage
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  var root = this;

  /**
   * Construct a Webpage
   *
   * Examples:
   *
   *     ioco.Webpage({ name: 'testbit' });
   *     // => a Webpage object
   *
   *
   * @param {object} attributes to be set for this Webpage
   * @api public
   */
  function Webpage( attrs ){
    ioco.log('initializing new Webpage with attrs: ', attrs);
    this._setupDefaultAttrs();
    for( var i in attrs )
      this[i] = attrs[i];
  }

  /**
   * setup default attributes for this Webpage
   *
   * @api private
   */
  Webpage.prototype._setupDefaultAttrs = function _setupDefaultAttrs(){
    this.name = 'no name for webpage';
    this.views = {
      default: {
        includes: {},
        content: {
          default: 'no content yet'
        }
      }
    };
    this.config = {
      classes: '',
      cssId: '',
      styles: '',
      js: ''
    }
  };

  /**
   * render a Webpage's html
   *
   * Example:
   *
   *     Webpage.render();
   *
   * @param {String} view - the view to use for rendering (if no view is given, 'default' will be used)
   * @param {String} lang - the language to use for rendering. see [Webpage] for more informations about language fallback system. If no lang is given, ioco.pageDesigner.options.defaultLang or 'default' will be used
   * @api public
   */
  Webpage.prototype.render = function renderWebpage( view, lang ){
    var _view = this.views.default
      , _lang = ioco.pageDesigner.defaultLang || 'default'
      , content;
    if( view in this.views )
      _view = view;
    if( lang in _view.content )
      _lang = lang;
    content = this.views[_view].content[_lang];
    return content;
  };

  /**
   * return this webpage as a kendo view model
   *
   * @api public
   */
  Webpage.prototype.viewModel = function viewModel(){

    if( !this._viewModel )
      this._viewModel = kendo.observable({
                name: this.name,
                webbits: kendo.observableHierarchy([
                    { name: this.name, type: "webpage", expanded: true, 
                      items: [
                        { name: "images", type: "folder", expanded: true, items: [
                            { name: "logo.png", type: "image" },
                            { name: "body-back.png", type: "image" },
                            { name: "my-photo.jpg", type: "image" }
                        ] },
                        { name: "resources", type: "folder", expanded: true, items: [
                            { name: "resources", type: "folder" },
                            { name: "zip", type: "folder" }
                        ] },
                        { name: "about.html", type: "html" },
                        { name: "contacts.html", type: "html" },
                        { name: "index.html", type: "html" },
                        { name: "portfolio.html", type: "html" }
                      ]
                    }
                ])
            });

    return this._viewModel;

  }

  root.ioco.Webpage = Webpage;

})();