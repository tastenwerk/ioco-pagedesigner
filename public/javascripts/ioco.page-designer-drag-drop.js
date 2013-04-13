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

  /**
   * setup drop event for given element
   *
   * @param {JQueryObject} - $elem
   *
   * @api private
   */
  PageDesignerDragDrop.prototype.setupDroppable = function setupDroppable( $elem, root ){
    var self = this;
    $elem.addClass('ioco-droppable');
    if( root )
      $elem.addClass('droppable-root');
    $elem.kendoDropTarget({
        dragenter: function( e ){
          $elem.prepend( $('<div class="can-drop-indicator"/>') );
        },
        dragleave: function( e ){
          $elem.find('.can-drop-indicator').remove();
        },
        drop: function( e ){
          var position = $elem.find('.can-drop-indicator').attr('class').replace('can-drop-indicator','').replace(' drop-','');
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
                                   decorate: function( content ){ return self.decorate( content ); } };
                self.insertWebBit( $elem, position, webbit );
              }
            })
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
      , $parent = $target.closest('.ioco-webbit,.ioco-webpage');

    if( position === 'inside' ){
      position = 'append';
      $parent = $target;
    } else if( position === 'right' )
      position = 'insertAfter';
    else if( position === 'left' )
      position = 'insertBefore';
    else
      ioco.log('error', 'unknown position for webbit', position);

    webbit.uid = this.treeView[position]( webbit, this.treeView.findByUid( $target.attr('data-ioco-uid') ) ).data('uid');

    parent = this.treeSource.getByUid( $parent.attr('data-ioco-uid') );
    console.log('inserting lang before', parent.lang);
    if( $parent === $target )
      parent.revisions[parent._currentRevision].views[parent._currentView].content[parent._currentLang] = parent.lang + '<div data-webbit-id="'+webbit._id+'"></div>';
    else
      throw Error('NOT IMPLEMENTED right, left');

    console.log('inserting lang', parent.lang, parent.getLang());

    this.update( parent );

    /*
    if( position === 'append' )
      $target.append( this.decorate( webbit.render() ) );
    else
      this.decorate( webbit.render() )[position]( $target )
    */
  }

  root.ioco.PageDesignerDragDrop = PageDesignerDragDrop;

})();