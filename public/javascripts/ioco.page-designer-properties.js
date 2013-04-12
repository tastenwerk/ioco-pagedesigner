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

  ioco.require('/javascripts/3rdparty/ace.js');

  function PageDesignerProperties(){};

  /**
   * show a properties modal window
   *
   * @api private
   */
  PageDesignerProperties.prototype.showProperties = function showProperties( webbit ){
    var $html = $(this.propertiesHTML);

    $(document).find('.k-window').remove();

    ioco.window({
      title: ioco.pageDesigner.t('Properties'),
      content: $html,
      width: '250px',
      activate: function activateProperties( $win ){
        kendo.bind( $html, webbit );
        $win.find('.ioco-pd-panelbar').kendoPanelBar({
          expandMode: "single"
        });
      }
    });
  };

  PageDesignerProperties.prototype.propertiesHTML = 
  '<ul class="ioco-pd-panelbar">'+
      '<li>'+
        '<span class="k-link k-state-selected">'+ioco.pageDesigner.t('Main Settings')+'</span>'+
        '<table style="padding-top: 10px">'+
          '<tr>'+
            '<td><label>'+ioco.pageDesigner.t('Name')+'</label></td>'+
            '<td><input type="text" data-bind="value: name" /></td>'+
          '</tr>'+
            '<td><label>'+ioco.pageDesigner.t('Type')+'</label></td>'+
            '<td><input type="text" disabled="disabled" data-bind="value: pluginName" /></td>'+
          '</tr>'+
        '</table>'+
        '<hr />'+
        '<a class="pull-right ioco-nobtn" data-editor-type="css" data-editor-title="Edit CSS Styles " data-bind="attr: {data-uid: uid}, events: { click: showStylesEditor }"><span class="ioco-pd-icn ioco-pd-icn-pencil"></span></a>'+
        '<h1>'+ioco.pageDesigner.t('CSS')+'</h1>'+
        '<table>'+
          '</tr>'+
            '<td><label>'+ioco.pageDesigner.t('ID')+'</label></td>'+
            '<td><input type="text" data-bind="value: config.styles" /></td>'+
          '</tr>'+
          '</tr>'+
            '<td><label>'+ioco.pageDesigner.t('Classes')+'</label></td>'+
            '<td><input type="text" data-bind="value: config.classes" /></td>'+
          '</tr>'+
        '</table>'+
        '<hr />'+
        '<a class="pull-right ioco-nobtn" data-editor-type="html" data-editor-title="Edit HTML Source " data-bind="attr: {data-uid: uid}, events: { click: showHtmlEditor }"><span class="ioco-pd-icn ioco-pd-icn-pencil"></span></a>'+
        '<h1>'+ioco.pageDesigner.t('HTML')+'</h1>'+
      '</li>'+
      '<li>'+
        '<span class="k-link">'+ioco.pageDesigner.t('Revisions')+'</span>'+
        '<div>here revs</div>'+
      '</li>'+
    '</ul>';

  /**
   * show styles editor
   * this is called from the observable models,
   * that's why it is a class method
   *
   * @api public
   */
  PageDesignerProperties.showSrcEditor = function showSrcEditor( e ){

    var $target = $(e.target).attr('data-uid') ? $(e.target) : $(e.target).closest('[data-uid]');
    var editorType = $target.attr('data-editor-type');

    ace.config.set("modePath", "/javascripts/3rdparty/ace");
    ace.config.set("workerPath", "/javascripts/3rdparty/ace");
    ace.config.set("themePath", "/javascripts/3rdparty/ace");

    $(document).find('.ioco-pd-editor').closest('.k-window').remove();
    var treeView = $(document).find('.webbits-tree:first').data('kendoTreeView');
    var webbit = treeView.dataSource.getByUid( $target.attr('data-uid') );
    webbit = webbit.orig ? webbit.orig : webbit;

    var $editorContent = $(PageDesignerProperties.srcEditorContent);
    var srcEditor;

    $editorContent.find('#src-editor').css('height', $(window).height()-200);

    ioco.window({
      title: ioco.pageDesigner.t($target.attr('data-editor-title'), {name: webbit.name}),
      width: 600,
      content: $editorContent,
      actions: ['Tick', 'Close'],
      activate: function( $win ){
        kendo.bind( $win.find('.ioco-pd-editor'), webbit );
        srcEditor = ace.edit( $win.find('#src-editor').get(0) );
        srcEditor.getSession().setMode('ace/mode/'+editorType);
        srcEditor.getSession().setUseWrapMode(true);
        srcEditor.getSession().setWrapLimitRange(80, 80);

        console.log('revision', editorType, webbit.getRevision().config[ editorType === 'css' ? 'styles' : editorType ]);
        if( editorType === 'html' )
          srcEditor.setValue( $('[data-ioco-uid='+webbit.uid+']').html() );
        else
          srcEditor.setValue( webbit.getRevision().config[ editorType === 'css' ? 'styles' : editorType ] );

        PageDesignerProperties[editorType+'SetupEvents']( srcEditor, webbit );

        $win.data('kendoWindow').wrapper.find(".k-i-tick").click(function(e){
          webbit.update( 'config.styles', srcEditor.getSession().getValue() );
          webbit.render();
          $win.data('kendoWindow').close();
        });
      },
      deactivate: function( $win ){
        webbit.builder.update( webbit );
        srcEditor.destroy();
      }
    });
  };

  /**
   * setup events for css editor
   *
   * @param {object} - ace editor object
   * @param {object} - webbit
   *
   * @api private
   */
  PageDesignerProperties.cssSetupEvents = function cssSetupEvents( srcEditor, webbit ){


    // watch annotations. if they match,
    // refresh css
    srcEditor.getSession().on("changeAnnotation", function(){
      if( srcEditor.getSession().getAnnotations().length < 1 )
        webbit.preview( 'config.styles', srcEditor.getSession().getValue() )
      //else
      //  console.log('error', srcEditor.getSession().getAnnotations());
    });

  }

  /**
   * setup events for css editor
   *
   * @param {object} - ace editor object
   * @param {object} - webbit
   *
   * @api private
   */
  PageDesignerProperties.htmlSetupEvents = function htmlSetupEvents( srcEditor, webbit ){

    // watch annotations. if they match,
    // refresh css
    srcEditor.getSession().on("change", function(){
      webbit.preview( 'content', srcEditor.getSession().getValue(), { store: false } )
    });

  }

  PageDesignerProperties.srcEditorContent = 
    '<div class="ioco-pd-editor">'+
      '<div id="src-editor"></div>'+
    '</div>';

  root.ioco.PageDesignerProperties = PageDesignerProperties;

})();