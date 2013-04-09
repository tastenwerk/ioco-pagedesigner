/**
 * iocoPageDesigner JQuery plugin
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  ioco.require('webpage');
  ioco.require('webbit');

  var root = this;

  /**
   * construct the pageDesignerBuilder
   * object
   *
   * @api public
   */
  function PageDesignerBuilder( options ){

    this.webpage = options.webpage || new ioco.Webpage();

  }

  PageDesignerBuilder.prototype.build = function buildPageDesignerBuilder(){

    var $div = $('<div/>').addClass('ioco-pd')
      .append( this.renderControls() )
      .append( this.renderWorkspace() );

    return $div;

  }

  /**
   * renders pageDesigner's CONTROLS
   *
   * @api private
   */
  PageDesignerBuilder.prototype.renderControls = function pdRenderControls(){
    this.$controlsDiv = $('<div/>').addClass('controls');

    var $mainControls = $('<div/>').addClass('ioco-pd-main-controls')
      .append( $('<a/>').addClass('ioco-pd-btn').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-close') ).attr('ioco-title', ioco.pageDesigner.t('close') ) )
      .append( $('<a/>').addClass('ioco-pd-btn w-text disabled').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-save') ).append( $('<span/>').addClass('icn-text').text( ioco.pageDesigner.t('Save') ) ).attr('ioco-title', ioco.pageDesigner.t('save') ) )
      .append( $('<a/>').addClass('ioco-pd-btn disabled').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-redo') ).attr('ioco-title', ioco.pageDesigner.t('redo last action')) )
      .append( $('<a/>').addClass('ioco-pd-btn disabled').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-undo') ).attr('ioco-title', ioco.pageDesigner.t('undo last action')) );

    this.$controlsDiv.append( $mainControls );

    this.$controlsTabs = $('<div/>').addClass('ioco-pd-tabs-container')
      .append( $('<ul/>').addClass('tabs-control') )
      .append( $('<div/>').addClass('tabs-content') );

    this.renderTreeTab();
    this.renderPluginListTab();
    this.renderPrefTab();

    this.$controlsDiv.append( this.$controlsTabs );

    var $controlsTitle = $('<span/>').addClass('ioco-text').text( 'ioco pageDesigner' );
    this.$controlsDiv.append( $controlsTitle );

    this.setupControlEvents();
    return this.$controlsDiv;

  }

  /**
   * renders pageDesigner's WORKSPACE
   *
   * @api private
   */
  PageDesignerBuilder.prototype.renderWorkspace = function pdRenderWorkspace(){
    var $workspaceDiv = $('<div/>').addClass('workspace')
    return $workspaceDiv;
  }

  /**
   * setup events for controlDiv
   *
   * @api private
   */
  PageDesignerBuilder.prototype.setupControlEvents = function pdSetupControlEvents(){

    this.setupControlTooltip();
    this.setupControlTabEvents();

  }

  /**
   * seutp tooltip for given div
   *
   * @api private
   */
  PageDesignerBuilder.prototype.setupControlTooltip = function pdSetupControlTooltip(){

    this.$controlsDiv.kendoTooltip({
      filter: '[ioco-title]',
      showAfter: 500,
      content: function(e) {
        return $(e.target).attr('ioco-title');
      }
    });

    this.$controlsDiv.kendoTooltip({
      filter: '[ioco-title-left]',
      showAfter: 500,
      position: 'left',
      content: function(e) {
        return $(e.target).attr('ioco-title-left');
      }
    });

  }

  /**
   * setup controls tabs events
   *
   * @api private
   */
  PageDesignerBuilder.prototype.setupControlTabEvents = function setupControlTabEvents(){

    var $controlsDiv = this.$controlsDiv;

    $controlsDiv.find('li.tab-control').on('click', function(){
      $controlsDiv.find('li.tab-control.active').removeClass('active');
      $controlsDiv.find('.tab-content').hide();
      $( $controlsDiv.find('.tab-content')[$(this).index()] ).show();
      $(this).addClass('active');
    });

    $controlsDiv.find('li.tab-control:first').click();

  }

  /**
   * render the tree tab
   *
   * @api private
   */
  PageDesignerBuilder.prototype.renderTreeTab = function renderTreeTab(){

    var $treeTab = $('<div/>').addClass('tab-content').attr('id', 'ioco-pd-tab-tree')
      .append( this.webPageBaseFormHTML );

    kendo.bind( $treeTab.find('.webpage-base-form'), this.webpage.viewModel() );
  
    this.$controlsTabs.find('.tabs-control').append( $('<li/>').addClass('tab-control').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-tree') ) );
    this.$controlsTabs.find('.tabs-content').append( $treeTab );
    
  },

  /**
   * render the SettingsTab
   *
   * @api private
   */
  PageDesignerBuilder.prototype.renderPrefTab = function renderPrefTab(){

    var $prefTab = $('<div/>').addClass('tab-content').attr('id', 'ioco-pd-tab-preferences')
      .append( this.webPagePrefFormHTML );

    kendo.bind( $prefTab.find('.webpage-pref-form'), this.webpage.viewModel() );

    this.$controlsTabs.find('.tabs-control').append( $('<li/>').addClass('tab-control').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-preferences') ) );
    this.$controlsTabs.find('.tabs-content').append( $prefTab );
    
  },

  /**
   * render the plugin list tab
   *
   * @api private
   */
  PageDesignerBuilder.prototype.renderPluginListTab = function renderPluginListTab(){

    var $pluginsList = $('<div/>').append('<p><label>'+ioco.pageDesigner.t('Drag and Drop plugins to the position where you want to create a new content')+'</label></p>')
      .append($('<ul/>').addClass('plugins-list'));

    for( var i=0, plugin; plugin=ioco.pageDesigner._plugins[i]; i++ ){
      $pluginsList.find('ul').append( $('<li/>').addClass('plugin-item')
                              .append($('<span/>').addClass('k-sprite '+plugin.name))
                              .append($('<span/>').text(plugin.name))
      );
    }

    var $pluginListTab = $('<div/>').addClass('tab-content').attr('id', 'ioco-pd-tab-plugin-list')
      .append( $pluginsList )

    this.$controlsTabs.find('.tabs-control').append( $('<li/>').addClass('tab-control').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-plus') ) );
    this.$controlsTabs.find('.tabs-content').append( $pluginListTab );

  }
  
  PageDesignerBuilder.prototype.webPageBaseFormHTML = '<form class="webpage-base-form">'+
    '<p><label>' + ioco.pageDesigner.t('Webbits') + '</label></p>'+
    '<div class="webbits-tree">'+
        '<div data-role="treeview"'+
            ' data-drag-and-drop="true"'+
            ' data-text-field="name"'+
            ' data-spritecssclass-field="type"'+
            ' data-bind="source: webbits"></div>'+
    '</div>'+
    '</form>';
  
  PageDesignerBuilder.prototype.webPagePrefFormHTML = 
    '<form class="webpage-pref-form">'+
      '<p>'+
        '<label>' + ioco.pageDesigner.t('Webpage Name') + '</label><br/>'+
        '<input type="text" data-bind="value: name" />'+
      '</p>'+
      '<p>'+
        '<label>' + ioco.pageDesigner.t('Tags') + '</label><br/>'+
        '<input type="text" data-bind="value: config.meta.keywords" />'+
      '</p>'+
      '<p>'+
        '<label>' + ioco.pageDesigner.t('Description') + '</label><br/>'+
        '<textarea data-bind="value: config.meta.description" />'+
      '</p>'+
    '</form>';

  root.ioco.PageDesignerBuilder = PageDesignerBuilder;

})();