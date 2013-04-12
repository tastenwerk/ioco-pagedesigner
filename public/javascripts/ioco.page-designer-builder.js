/**
 * iocoPageDesigner Builder
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  ioco.require('page-designer-properties');
  ioco.require('page-designer-drag-drop');
  
  ioco.require('webpage');
  ioco.require('webbit');

  ioco.require('3rdparty/kendo.core.min');
  ioco.require('3rdparty/kendo.data.min');


  ioco.require('3rdparty/kendo.web.min');
  

  var root = this;

  /**
   * construct the pageDesignerBuilder
   * object
   *
   * @api public
   */
  function PageDesignerBuilder( options ){

    var self = this;

    this.webpage = options.webpage || new ioco.Webpage();
    this.webpage.builder = { update: function( webbit, options ){ self.update( webbit, options ); } };

    for( var i in ioco.PageDesignerProperties.prototype )
      this[i] = ioco.PageDesignerProperties.prototype[i];

    for( var i in ioco.PageDesignerDragDrop.prototype )
      this[i] = ioco.PageDesignerDragDrop.prototype[i];

  }

  PageDesignerBuilder.prototype.build = function buildPageDesignerBuilder(){

    var $div = $('<div/>').addClass('ioco-pd')
      .append( this.renderWorkspace() )
      .append( this.renderControls() );

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
    this.renderRevisionsTab();

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
    this.$workspaceDiv = $('<div/>').addClass('workspace');

    this.$workspaceDiv.append( this.decorate( this.webpage.render(), true ) );

    return this.$workspaceDiv;
  }

  /**
   * update current webbit view representation in workspace
   *
   * @param {Webbit} webbit - the webbit to update
   * @param {object} options
   *  * revision
   *  * view
   *  * lang
   *
   * @api public
   */
  PageDesignerBuilder.prototype.update = function update( webbit, options ){
    options = options || {};
    this.$workspaceDiv.find('[data-ioco-id='+webbit._id+']').replaceWith( 
      this.decorate( webbit.render( options ), true ) 
    );
  }


  /**
   * decorate a webbit and attach events
   *
   * @param {String} html content of webbit
   * @param {Boolean} set this content as root content
   *
   * @api private
   */
  PageDesignerBuilder.prototype.decorate = function decrate( content, root ){
    var $content = $(content)
    if( !root )
      $content.css('position','relative').addClass('decorated');
    this.setupDroppable( $content, root );
    this.setupWebbitEvents( $content );
    return $content;
  }

  /**
   * setup webbit events
   * click selects according entry in tree and opens
   * property window
   *
   * @api private
   */
  PageDesignerBuilder.prototype.setupWebbitEvents = function setupWebbitEvents( $content ){
    var self = this;
    $content.on('click', function( e ){

      e.stopPropagation();
      // select according tree item
      var treeView = self.$controlsDiv.find('.webbits-tree').data('kendoTreeView')
      var uid = $(e.target).attr('data-ioco-uid');

      if( $content.hasClass('active') ){
        treeView.select( $() );
        $content.removeClass('active');
      } else {
        $content.closest('.ioco-pd').find('.ioco-webbit.active,.ioco-webpage.active').removeClass('active');
        treeView.select( treeView.findByUid( uid ) );
        $content.addClass('active');
        // show tree view
        self.$controlsDiv.find('.tab-control:first').click();
        self.$controlsDiv.find('[data-uid='+ uid +']');
        self.showProperties( treeView.dataSource.getByUid( uid ) );
      }

    }).on('mouseenter', function( e ){
      $(this).addClass('hovered');
    }).on('mouseleave', function( e ){
      $(this).removeClass('hovered');
    });
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

  };

  /**
   * render the tree tab
   *
   * @api private
   */
  PageDesignerBuilder.prototype.renderTreeTab = function renderTreeTab(){

    var $treeTab = $('<div/>').addClass('tab-content').attr('id', 'ioco-pd-tab-tree')
      .append( this.webPageBaseFormHTML );

    kendo.bind( $treeTab.find('.webpage-base-form'), this.webpage.viewModel() );

    this.setupTreeEvents( $treeTab.find('.webbits-tree'), $treeTab.find('.webbits-tree').data('kendoTreeView') );
  
    this.$controlsTabs.find('.tabs-control').append( $('<li/>').addClass('tab-control').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-tree') ) );
    this.$controlsTabs.find('.tabs-content').append( $treeTab );
    
  };

  /**
   * setup events for the tree
   *
   * @param {jQueryElem} - the jQuery elem
   * @param {KendoTreeView} - the tree view object
   *
   * @api private
   *
   */
  PageDesignerBuilder.prototype.setupTreeEvents = function setupTreeEvents( $tree, treeView ){
    var $workspace = this.$workspaceDiv;
    var self = this;
    $tree.on('click', 'li.k-item', function(e){
      e.stopPropagation();
      var uid = $(this).attr('data-uid');
      var $webbitElem = $workspace.find('.ioco-webbit[data-ioco-uid='+uid+'],.ioco-webpage[data-ioco-uid='+uid+']');
      if( $webbitElem.hasClass('active') && !$webbitElem.hasClass('hovered') ){
        treeView.select( $() );
        $webbitElem.removeClass('active');
      } else{
        $workspace.find('.active').removeClass('active').removeClass('hovered');
        $webbitElem.addClass('active');
        self.showProperties( treeView.dataSource.getByUid( uid ) );
      }
    }).on('mouseenter', 'li.k-item', function(e){
      e.stopPropagation();
      var $webbitElem = $workspace.find('.ioco-webbit[data-ioco-uid='+$(this).attr('data-uid')+'],.ioco-webpage[data-ioco-uid='+$(this).attr('data-uid')+']');
      $workspace.find('.active').removeClass('active').removeClass('hovered');
      $webbitElem.addClass('active hovered');
    }).on('mouseleave', 'li.k-item', function(e){
      $workspace.find('.active').removeClass('active').removeClass('hovered');
      var uid = $tree.find('li .k-state-selected').closest('li').attr('data-uid');
      $workspace.find('.ioco-webbit[data-ioco-uid='+uid+'],.ioco-webpage[data-ioco-uid='+uid+']').addClass('active');
    });
  };

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
   * render the RevisionsTab
   *
   * @api private
   */
  PageDesignerBuilder.prototype.renderRevisionsTab = function renderRevisionsTab(){

    // append revisions tmpl script if not already appended to body
    if( $('body').find('#webpage-revisions-template').length <= 0 )
      $('body').append( this.webPageRevisionsTmpl );

    var $revTab = $('<div/>').addClass('tab-content').attr('id', 'ioco-pd-tab-revisions')
      .append( this.webPageRevisionsHTML );

    kendo.bind( $revTab.find('.webpage-revisions'), this.webpage.viewModel() );

    this.$controlsTabs.find('.tabs-control').append( $('<li/>').addClass('tab-control').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-revisions') ) );
    this.$controlsTabs.find('.tabs-content').append( $revTab );
    
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
                              .append($('<span/>').addClass('name').text(plugin.name))
      );
    }

    var $pluginListTab = $('<div/>').addClass('tab-content').attr('id', 'ioco-pd-tab-plugin-list')
      .append( $pluginsList )

    this.$controlsTabs.find('.tabs-control').append( $('<li/>').addClass('tab-control').append( $('<span/>').addClass('ioco-pd-icn ioco-pd-icn-plus') ) );
    this.$controlsTabs.find('.tabs-content').append( $pluginListTab );

    this.setupPluginListEvents( $pluginsList );

  }

  /**
   * setup events for plugin list tab
   *
   * makes plugins draggable
   *
   */
  PageDesignerBuilder.prototype.setupPluginListEvents = function setupPluginListEvents( $pluginsList ){
    var self = this;
    $pluginsList.find('li.plugin-item').kendoDraggable({
      hint: function( item ) {
        return $(item).clone().addClass('dragged-plugin');
      },
      drag: function( e ){
        if( !$(e.target).hasClass('ioco-droppable') )
          return;
        var $target = $(e.target);
        if( e.pageX < ($target.width() / 4) && !$target.hasClass('droppable-root') )
          $target.find('.can-drop-indicator').removeClass('drop-right').removeClass('drop-inside').addClass('drop-left');
        else if( e.pageX > ($target.width() / 4) * 3 && !$target.hasClass('droppable-root') )
          $target.find('.can-drop-indicator').removeClass('drop-left').removeClass('drop-inside').addClass('drop-right');
        else
          $target.find('.can-drop-indicator').removeClass('drop-right').removeClass('drop-left').addClass('drop-inside');
      },
      dragstart: function( e ){
        self.$workspaceDiv.find('.ioco-droppable').addClass('can-drop-here');
      },
      dragend: function( e ){
        self.$workspaceDiv.find('.can-drop-here').removeClass('can-drop-here');
      }
    });
  }
  
  PageDesignerBuilder.prototype.webPageBaseFormHTML = '<form class="webpage-base-form">'+
    '<p><label>' + ioco.pageDesigner.t('Webbits') + '</label></p>'+
    '<div class="webbits-tree" data-role="treeview"'+
            ' data-drag-and-drop="true"'+
            ' data-text-field="name"'+
            ' data-spritecssclass-field="pluginName"'+
            ' data-bind="source: webbits"></div>'+
    '</form>';
  
  PageDesignerBuilder.prototype.webPagePrefFormHTML = 
    '<form class="webpage-pref-form">'+
      '<p>'+
        '<label>' + ioco.pageDesigner.t('Webpage Name') + '</label><br/>'+
        '<input type="text" data-bind="value: name" />'+
      '</p>'+
      '<p>'+
        '<label>' + ioco.pageDesigner.t('Tags') + '</label><br/>'+
        '<input type="text" data-bind="value: revision.config.meta.keywords" />'+
      '</p>'+
      '<p>'+
        '<label>' + ioco.pageDesigner.t('Description') + '</label><br/>'+
        '<textarea data-bind="value: revision.config.meta.description" />'+
      '</p>'+
    '</form>';

  PageDesignerBuilder.prototype.webPageRevisionsTmpl = 
    '<script id="webpage-revisions-template" type="text/x-kendo-template">'+
      '<li class="revision-item">'+
        '<strong>#: data.name #</strong></br>'+
      '</li>'+
    '</script>';

  PageDesignerBuilder.prototype.webPageRevisionsHTML = 
    '<div class="webpage-revisions">'+
      '<p><label>' + ioco.pageDesigner.t('Revisions') + '</label></p>'+
      '<ul data-bind="source: revisions" data-role="list-view" data-template="webpage-revisions-template"></ul>'+
    '</div>';

  root.ioco.PageDesignerBuilder = PageDesignerBuilder;

})();