(function(){

  var textEditor = {
    name: 'text-editor',
    iconClass: 'icn-justifyFull', // use an icon from ioco-sprites
    defaultContent: 'Enter your text here',
    addControls: [
      {
        iconClass: 'icn-pencil',
        hoverTitle: ioco.pageDesigner.translate('Edit text'),
        editorId: 'editor-'+(new Date()).getTime().toString(36),
        action: function( e, $box ){

          var editorId = this.editorId;

          function initEditor(){
            CKEDITOR.disableAutoInline = true;
            CKEDITOR.basePath = '/javascripts/3rdparty/ckeditor/';
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
        title: ioco.pageDesigner.translate('Language'),
        html: 'languages plugin'
      }
    ],
    onDeactivate: function( $box ){
      if( typeof( CKEDITOR ) === 'object' )
        CKEDITOR.remove( this.addControls[0].editorId );
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