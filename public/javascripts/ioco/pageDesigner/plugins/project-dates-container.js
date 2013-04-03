(function(){

  var root = this;

  var projectDatesContainer = {
    name: 'project-dates-container',
    iconClass: 'icn-checkbox checked',
    defaults: {

      properties: {
        cssClasses: 'span1'
      },

      api: {
        url: 'dates_controller:getProjectDates',
        data: { "project_id": "#{_id}" },
        postProcTemplate: 'h1 project dates templates'
      }
      
    }
  };

  // expose emptyContainer to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs
    module.exports = projectDatesContainer;
  } else {
    if( !root.ioco.pageDesigner )
      throw new Error('ioco.pageDesigner is not defined. Load this plugin AFTER ioco.pageDesigner has been loaded!')
    root.ioco.pageDesigner.addPlugin( projectDatesContainer );
  }

})();