/**
 * ioco pageDesigner DRAG & DROP handler
 *
 * (c) TASTENWERK 2013
 *
 * web: http://iocojs.org/plugins/page-designer
 *
 */

( function(){

  var root = this;

  PageDesignerDragDrop = function(){}

  PageDesignerDragDrop.prototype.setupDraggable = function setupDraggable( $elem ){

    var self = this;

    $elem.find('.ioco-pd-icn-move').kendoDraggable({
      hint: function(element) {
         return element.closest('.ioco-webbit').clone();
      },
      drag: function( e ){
        if( !$elem.hasClass('ioco-something-dragging') )
          return;
        if( !$(e.target).hasClass('ioco-droppable') )
          return;
        if( $(e.target).attr('data-ioco-uid') === $elem.attr('data-ioco-uid') )
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
        if( $('.ioco-something-dragging').length )
          return;
        $elem.addClass('ioco-something-dragging');
        self.$workspaceDiv.find('.ioco-droppable').addClass('can-drop-here');
      },
      dragend: function( e ){
        $elem.removeClass('ioco-something-dragging');
        self.$workspaceDiv.find('.can-drop-here').removeClass('can-drop-here');
      }
    });

  }

  /**
   * setup drop event for given element
   *
   * @param {JQueryObject} - $elem
   *
   * @api private
   */
  PageDesignerDragDrop.prototype.setupDroppable = function setupDroppable( $elem ){
    var self = this;
    $elem.addClass('ioco-droppable');
    if( $elem.hasClass('ioco-webpage') )
      $elem.addClass('droppable-root');
    $elem.kendoDropTarget({
        dragenter: function( e ){
          if( $(e.target).attr('data-ioco-uid') ){
            self.$controlsDiv.find('.tab-control:first').click();
            self.treeView.select( self.treeView.findByUid( $elem.attr('data-ioco-uid') ) );
          }
          $elem.prepend( $('<div class="can-drop-indicator"/>') );
        },
        dragleave: function( e ){
            $elem.find('.can-drop-indicator').remove();
          self.treeView.select( $() );
        },
        drop: function( e ){
          var $dropIndi = $elem.find('.can-drop-indicator');
          if( $dropIndi.length < 1 )
            return;
          var position = $dropIndi.attr('class').replace('can-drop-indicator','').replace(' drop-','');
          $('.can-drop-indicator').remove();
          if( $(e.target).hasClass('plugin-item') ){
            var pluginName = $(e.target).find('.name').text();
            ioco.window({
              type: 'dialog',
              title: ioco.pageDesigner.t('Enter Name for new', {pluginName: pluginName}),
              content: ioco.pageDesigner.t('New Webbit Name'),
              submit: function( name ){
                var webbit = new ioco.Webbit({ pluginName: pluginName, name: name });
                webbit.builder = { update: function( webbit, options ){ self.update( webbit, options ); },
                                   decorate: function( content ){ console.log('we decorate'); return self.decorate( content ); } };
                self.insertWebBit( $elem, position, webbit );
              }
            })
          } else if( $(e.target).closest('.ioco-webbit') ){
            var webbit = self.treeSource.getByUid( $(e.target).closest('.ioco-webbit').attr('data-ioco-uid') );
            $(e.target).remove();
            self.remove( webbit );
            self.insertWebBit( $elem, position, webbit );
          }
        }
    });
  }

  /**
   * insert a webbit at given target
   *
   * @param {jqueryElem} $target
   * @param {String} position where to insert the webbit (left, inside, right)
   * @param {Webbit} webbit
   *
   * @api private
   */
  PageDesignerDragDrop.prototype.insertWebBit = function insertWebBit( $target, position, webbit ){
      
    var parent
      , newStr = '<div data-ioco-id="'+webbit._id+'"></div>';

    parent = this.treeSource.getByUid( $target.attr('data-ioco-uid') );

    if( position === 'inside' ){
      parent.revisions[parent._currentRevision].views[parent._currentView].content[parent._currentLang] = parent.getLang() + newStr;
    } else {
      parent = this.treeSource.getByUid( $target.parent().attr('data-ioco-uid') );
      var $parStr = $('<div/>').append(parent.getLang());
      var $insertionPoint = $parStr.find('[data-ioco-id='+$target.attr('data-ioco-id')+']');
      if( position === 'right' )
        $(newStr).insertAfter( $insertionPoint );
      else if( position === 'left' )
        $(newStr).insertBefore( $insertionPoint );
      else
        ioco.log('error', 'unknown position for webbit', position);
      parent.revisions[parent._currentRevision].views[parent._currentView].content[parent._currentLang] = $parStr.html();
    }
    parent.append( webbit );

    this.update( parent );

    /*
    if( position === 'append' )
      $target.append( this.decorate( webbit.render() ) );
    else
      this.decorate( webbit.render() )[position]( $target )
    */
  }

  /**
   * remove a given node
   *
   * @api private
   */
  PageDesignerDragDrop.prototype.remove = function remove( webbit ){
    var $newStr = $('<div/>').append(webbit.parentNode().getLang())
      , parent = webbit.parentNode();
    $newStr.find('[data-ioco-id='+webbit._id+']').remove();
    parent.revisions[parent._currentRevision].views[parent._currentView].content[parent._currentLang] = $newStr.html();
    $('[data-ioco-uid='+webbit.uid+']').remove();
    this.treeSource.remove( webbit );
  }

  root.ioco.PageDesignerDragDrop = PageDesignerDragDrop;

})();