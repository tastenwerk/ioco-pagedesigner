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
    this.name = 'Noname';
    this.revisions = {};
    this.revisions.master = {};
    this.revisions.master.views = {
      default: {
        includes: {},
        content: {
          default: ''
        }
      }
    };
    this.revisions.master.config = {
      classes: '',
      cssId: '',
      styles: '',
      js: '',
      meta: {
        keywords: 'no keys',
        description: 'no desc'
      }
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
  Webpage.prototype.render = function renderWebpage( options ){
    options = options || {};
    rev = options.revision || 'master';
    var _view = this.revisions[rev].views.default
      , _lang = ioco.pageDesigner.defaultLang || 'default'
      , content;
    if( options.view in _view )
      _view = view;
    if( options.lang in _view.content )
      _lang = lang;

    return '<div class="ioco-webpage '+this.applyStyles(rev,'classes')+'"'+
      ' data-ioco-uid="'+this.viewModel().uid+'">'+_view.content[_lang]+
      '</div>';
  };

  /**
   * get webpage's styles
   *
   * @param {String} revision
   * @param {String} key (classes, cssId, styles, ...)
   *
   * @returns {String} css classes
   *
   * @api private
   */
  Webpage.prototype.applyStyles = function applyStyles( revision, key ){
    var config = this.revisions[revision].config;
    return config[key];
  }

  /**
   * return this webpage as a kendo view model
   *
   * @api public
   */
  Webpage.prototype.viewModel = function viewModel(){

    if( !this._viewModel ){
      var revs = [];
      for( var i in this.revisions )
        revs.push( { name: i, data: this.revisions[i] } );

      this._viewModel = kendo.observable({
                name: this.name,
                revision: this.revision,
                webbits: kendo.observableHierarchy([
                    { name: this.name, pluginName: "webpage", expanded: true, 
                      items: []
                    }
                ]),
              revisions: kendo.observableHierarchy( revs )
            });
      this._viewModel.webbits[0].uid = this._viewModel.uid;
    }

    return this._viewModel;

  }

  /**
   * get current revision or master
   *
   * @api public
   */
  Object.defineProperty( Webpage.prototype, 'revision', {
    get: function(){
      return this.revisions[ this._currentRevision ];
    }
  });

  /**
   * hold current revision name (defaults to master)
   *
   * @api public
   */
  Object.defineProperty( Webpage.prototype, '_currentRevision', {
    value: 'master',
    writeable: true
  });

  root.ioco.Webpage = Webpage;

})();