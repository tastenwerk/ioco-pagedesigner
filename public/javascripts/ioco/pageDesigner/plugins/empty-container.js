(function(){

  var root = this;

  var emptyContainer = {
    name: 'empty-container',
    iconClass: 'icn-plain' // use an icon from ioco-sprites
  };

  // expose emptyContainer to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs
    module.exports = emptyContainer;
  } else {
    if( !root.ioco.pageDesigner )
      throw new Error('ioco.pageDesigner is not defined. Load this plugin AFTER ioco.pageDesigner has been loaded!')
    root.ioco.pageDesigner.addPlugin( emptyContainer );
  }

})();