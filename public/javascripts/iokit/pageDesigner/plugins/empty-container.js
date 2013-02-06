(function(){

  var root = this;

  var emptyContainer = {
    name: 'empty-container',
    iconClass: 'icn-plain' // use an icon from iokit-sprites
  };

  // expose emptyContainer to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs
    module.exports = emptyContainer;
  } else {
    if( !root.iokit.pageDesigner )
      throw new Error('iokit.pageDesigner is not defined. Load this plugin AFTER iokit.pageDesigner has been loaded!')
    root.iokit.pageDesigner.addPlugin( emptyContainer );
  }

})();