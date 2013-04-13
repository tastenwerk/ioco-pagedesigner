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
      webpage: options.webpage || null,
      save: options.save || null
    });

    $container.html('')
      .append( pdBuilder.build() );

    window.onbeforeunload = function() {
      if( $container.find('.ioco-pd-save-all').hasClass('enabled') )
        return ioco.pageDesigner.t('There is still unsaved data. Continue?');
    }

  }

  jQuery.fn.iocoPageDesigner = pageDesignerJQueryPlugin;

})();