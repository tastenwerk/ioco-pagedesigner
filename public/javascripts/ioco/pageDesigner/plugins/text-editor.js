(function(){

  var textEditor = {
    name: 'text-editor',
    iconClass: 'icn-justifyFull', // use an icon from ioco-sprites
    defaultContent: 'Enter your text here',
    preventClickDeactivate: true,
    addControls: [
      {
        iconClass: 'icn-pencil',
        title: 'Edit text',
        editorId: 'editor-'+(new Date()).getTime().toString(36),
        action: function( $box, e ){

          var editorId = this.editorId;

          function initEditor(){
            CKEDITOR.disableAutoInline = true;
            CKEDITOR.basePath = '/javascripts/3rdparty/ckeditor/';
            $box.addClass('edit-mode');
            $box.find('.box-content').attr('contenteditable', true).attr('id', editorId );
            CKEDITOR.config.toolbar = [
              [ 'Cut','Copy','Paste','PasteText','PasteFromWord'],
              [ 'Undo','Redo' ],
              [ 'Bold','Italic','Underline','Strike','-','RemoveFormat', 'NumberedList','BulletedList','-',
  '-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-', 'Link','Unlink','Anchor' ]
            ]
            CKEDITOR.inline( editorId, {
              on: {
                blur: function( event ) {
                  $box.data('webBit').content = event.editor.getData();
                  $box.find('.box-content').html( event.editor.getData() );
                  this.destroy();
                }
              }
            });
            $box.find('.box-content').focus();
          }
          if( typeof(CKEDITOR) === 'undefined')
            $.getScript( '/javascripts/3rdparty/ckeditor/ckeditor.js', initEditor);
          else
            initEditor();
        }
      }
    ],
    addProperties: [
      {
        title: 'Language',
        html: 'languages plugin'
      }
    ],
    on: function( action, $box ){
      if( action === 'deactivate' ){
        $box.removeClass('edit-mode');
        if( typeof( CKEDITOR ) === 'object' && CKEDITOR.instances[ this.addControls[0].editorId ] ){
          CKEDITOR.instances[ this.addControls[0].editorId ].destroy();
          $box.find('.box-content').attr('contenteditable', false);
        }
      }
    }
  }

  // expose emptyContainer to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs
    module.exports = textEditor;
  } else {
    if( !this.ioco.pageDesigner )
      throw new Error('ioco.pageDesigner is not defined. Load this plugin AFTER ioco.pageDesigner has been loaded!')
    this.ioco.pageDesigner.addPlugin( textEditor );
  }

})();