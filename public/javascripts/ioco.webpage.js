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

    ioco.PageDesignerRenderer.init.call( this );

    this.expanded = true;

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
  root.ioco.Webpage = Webpage;

})();