/**
 * iocoPageDesigner Properties Modal
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

 ( function(){

  var root = this;

  function PageDesignerProperties(){};

  PageDesignerProperties.prototype.showProperties = function showProperties( webbit ){
    ioco.window({
      title: ioco.pageDesigner.t('Properties'),
      content: this.propertiesHTML
    });
  };

  PageDesignerProperties.prototype.propertiesHTML = 
    '<div class="side-tabs">'+
      '<ul class="side-tabs-nav">'+
        '<li>HTML</li>'+
        '<li>CSS</li>'+
        '<li>JavaScript</li>'+
        '<li>Revisions</li>'+
      '</ul>'+
      '<div class="side-tabs-content">'+
        '<div class="sidebar-entry">'+
          '<h1>html</h1>'+
        '</div>'+
        '<div class="sidebar-entry">'+
        '</div>'+
        '<div class="sidebar-entry">'+
        '</div>'+
        '<div class="sidebar-entry">'+
        '</div>'+
      '</div>'+
    '</div>';

  root.ioco.PageDesignerProperties = PageDesignerProperties;

})();