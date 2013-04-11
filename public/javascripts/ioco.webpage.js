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

    for( var i in ioco.PageDesignerRenderer.prototype )
      this[i] = ioco.PageDesignerRenderer.prototype[i];

  }

  /**
   * setup default attributes for this Webpage
   *
   * @api private
   */
  Webpage.prototype._setupDefaultAttrs = function _setupDefaultAttrs(){
    this.name = 'Noname';
    this._id = 'noidyet';
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
                    { name: this.name, pluginName: "webpage", config: this.revision.config, expanded: true, 
                      showStylesEditor: ioco.PageDesignerProperties.showSrcEditor,
                      showHtmlEditor: ioco.PageDesignerProperties.showSrcEditor,
                      orig: this,
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
    },
    enumerable: true
  });

  /**
   * hold current revision name (defaults to master)
   *
   * @api public
   */
  Object.defineProperty( Webpage.prototype, '_currentRevision', {
    value: 'master',
    writeable: true,
    enumerable: true
  });

  root.ioco.Webpage = Webpage;

})();