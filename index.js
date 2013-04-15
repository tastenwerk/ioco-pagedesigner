pageDesigner = require( __dirname + '/public/javascripts/ioco.page-designer' );

module.exports = exports = {

  ioco: {

    plugins: {

      pageDesigner: {

        statics: {
          public: __dirname + '/public'
        },

        pageDesignerJSPlugins: [ '/javascripts/ioco.page-designer.empty-container.js',
                                 '/javascripts/ioco/page-designer.text-editor.js' ],

        translations: __dirname+'/public/locales'
        
      }

    }
  },

  lib: pageDesigner,
  Webpage: require(__dirname+'/public/javascripts/ioco.webpage'),
  Webbit: require(__dirname+'/public/javascripts/ioco.webbit'),

  renderer: require(__dirname+'/public/javascripts/ioco.page-designer-renderer')
  
};