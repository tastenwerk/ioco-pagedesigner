module.exports = exports = {

  pageDesigner: {

    statics: {
      public: __dirname + '/public'
    },

    pageDesignerJSPlugins: [ '/javascripts/ioco/pageDesigner/plugins/empty-container.js',
                             '/javascripts/ioco/pageDesigner/plugins/text-editor.js' ],

    translations: __dirname+'/public/locales'
    
  }

};