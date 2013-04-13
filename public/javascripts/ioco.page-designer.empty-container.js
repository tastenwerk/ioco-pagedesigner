/**
 * iocoPageDesigner JQuery plugin
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */
 (function(){

  var root = this;
  var isNode = (typeof(module) === 'object');

  var plugin = {
    name: 'empty-container'
  };

  if( isNode )
    module.exports = exports = plugin;
  else
    root.ioco.pageDesigner.registerPlugin( plugin );


})();