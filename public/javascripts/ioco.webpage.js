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

  var isNode = (typeof(module) === 'object');

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
    this._setupDefaultAttrs();
    for( var i in attrs )
      this[i] = attrs[i];

    if( isNode )
      require(__dirname+'/ioco.page-designer-renderer').init.call( this );
    else
      ioco.PageDesignerRenderer.init.call( this );

  }

  /**
   * setup default attributes for this Webpage
   *
   * @api private
   */
  Webpage.prototype._setupDefaultAttrs = function _setupDefaultAttrs(){
    this.name = 'Noname';
    this._id = 'noidyet';
    this._type = 'Webpage';
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

  if( isNode )
    module.exports = exports = Webpage;
  else
    root.ioco.Webpage = Webpage;

})();