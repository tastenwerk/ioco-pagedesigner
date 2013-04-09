pageDesigner = require( __dirname + '/public/javascripts/ioco.page-designer' );

module.exports = exports = {

  ioco: {

    plugins: {

      pageDesigner: {

        statics: {
          public: __dirname + '/public'
        },

        pageDesignerJSPlugins: [ '/javascripts/ioco/pageDesigner/plugins/empty-container.js',
                                 '/javascripts/ioco/pageDesigner/plugins/text-editor.js' ],

        translations: __dirname+'/public/locales'
        
      }

    }
  },

  lib: {}
  
};