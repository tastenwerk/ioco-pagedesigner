/**
 * iocoPageDesigner JQuery plugin
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  ioco.require('page-designer');
  ioco.require('page-designer-renderer');
  ioco.require('page-designer-builder');

  function pageDesignerJQueryPlugin( options ){
    options = options || {};
    
    var $container = $(this);

    for( var i in options )
      ioco.pageDesigner.options[i] = options[i];

    var pdBuilder = new ioco.PageDesignerBuilder({
      webpage: options.webpage || null
    });

    $container.html('')
      .append( pdBuilder.build() );

  }

  jQuery.fn.iocoPageDesigner = pageDesignerJQueryPlugin;

})();