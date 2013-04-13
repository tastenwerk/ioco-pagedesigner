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
          expandMode: 'single'
        });
      }
    });
  };

  PageDesignerProperties.prototype.propertiesHTML = 
  '<ul class="ioco-pd-panelbar">'+
      '<li class="k-state-active">'+
        ioco.pageDesigner.t('Main Settings')+
        '<div>'+
          '<table style="padding-top: 10px">'+
            '<tr>'+
              '<td><label>'+ioco.pageDesigner.t('Name')+'</label></td>'+
              '<td><input type="text" data-bind="value: name" /></td>'+
            '</tr>'+
              '<td><label>'+ioco.pageDesigner.t('Plugin')+'</label></td>'+
              '<td><input type="text" disabled="disabled" data-bind="value: pluginName" /></td>'+
            '</tr>'+
            '</tr>'+
              '<td><label>'+ioco.pageDesigner.t('Revision')+'</label></td>'+
              '<td><select data-role="dropdownlist" data-bind="source: revisionsArray, value: _currentRevision"></select></td>'+
            '</tr>'+
          '</table>'+
          '<hr />'+
          '<a class="pull-right ioco-nobtn" data-editor-type="css" data-editor-title="Edit CSS Styles " data-bind="attr: {data-uid: uid}, events: { click: showStylesEditor }"><span class="ioco-pd-icn ioco-pd-icn-pencil"></span></a>'+
          '<h1>'+ioco.pageDesigner.t('CSS')+'</h1>'+
          '<table>'+
            '</tr>'+
              '<td><label>'+ioco.pageDesigner.t('ID')+'</label></td>'+
              '<td><input type="text" data-bind="value: getRevision().config.styles" /></td>'+
            '</tr>'+
            '</tr>'+
              '<td><label>'+ioco.pageDesigner.t('Classes')+'</label></td>'+
              '<td><input type="text" data-bind="value: getRevision().config.classes, events: { change: updateRender }" /></td>'+
            '</tr>'+
          '</table>'+
          '<hr />'+
          '<a class="pull-right ioco-nobtn" data-editor-type="html" data-editor-title="Edit HTML Source " data-bind="attr: {data-uid: uid}, events: { click: showHtmlEditor }"><span class="ioco-pd-icn ioco-pd-icn-pencil"></span></a>'+
          '<h1>'+ioco.pageDesigner.t('HTML')+'</h1>'+
        '</div>'+
      '</li>'+
      '<li>'+
        ioco.pageDesigner.t('Revisions')+
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

        if( editorType === 'html' )
          srcEditor.setValue( webbit.getLang() );
        else
          srcEditor.setValue( webbit.getRevision().config[ editorType === 'css' ? 'styles' : editorType ] );

        PageDesignerProperties[editorType+'SetupEvents']( srcEditor, webbit, $win );

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
  PageDesignerProperties.cssSetupEvents = function cssSetupEvents( srcEditor, webbit, $win ){


    // watch annotations. if they match,
    // refresh css
    srcEditor.getSession().on("changeAnnotation", function(){
        if( srcEditor.getSession().getAnnotations().length < 1 ){
          console.log('guilty')
          webbit.preview( 'config.styles', srcEditor.getSession().getValue() )
        }
        //else
        //  console.log('error', srcEditor.getSession().getAnnotations());
    });

    $win.data('kendoWindow').wrapper.find(".k-i-tick").click(function(e){
      webbit.update( 'config.styles', srcEditor.getSession().getValue() );
      $win.data('kendoWindow').close();
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
  PageDesignerProperties.htmlSetupEvents = function htmlSetupEvents( srcEditor, webbit, $win ){

    // watch annotations. if they match,
    // refresh css
    srcEditor.getSession().on("change", function(){
      webbit.preview( 'content', srcEditor.getSession().getValue(), { store: false } )
    });

    $win.data('kendoWindow').wrapper.find(".k-i-tick").click(function(e){
      webbit.setContent( srcEditor.getSession().getValue() );
      $win.data('kendoWindow').close();
    });

  }

  PageDesignerProperties.srcEditorContent = 
    '<div class="ioco-pd-editor">'+
      '<div id="src-editor"></div>'+
    '</div>';

  root.ioco.PageDesignerProperties = PageDesignerProperties;

})();