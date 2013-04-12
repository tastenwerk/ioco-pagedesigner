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
                webbit.builder = { update: function( webbit, options ){ self.update( webbit, options ); } };
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
    
    var target = $('[data-uid='+$target.attr('data-ioco-uid')+']');

    if( position === 'inside' )
      position = 'append';
    else if( position === 'right' )
      position = 'insertAfter';
    else if( position === 'left' )
      position = 'insertBefore';
    else
      ioco.log('error', 'unknown position for webbit', position);

    webbit.uid = this.$controlsDiv.find('.webbits-tree').data('kendoTreeView')[position]( webbit, target ).data('uid');

    if( position === 'append' )
      $target.append( this.decorate( webbit.render() ) );
    else
      this.decorate( webbit.render() )[position]( $target )
  }

  root.ioco.PageDesignerDragDrop = PageDesignerDragDrop;

})();