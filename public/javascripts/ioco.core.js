( function(){

  /**
  * adds a blocking modal box to the whole
  * screen
  *
  * @param {String} [html] the html string to be rendered to this modal
  * also, action strings are valid:
  *
  * @param {Object} [options] options are:
  * * height: desired height of modal window
  * * before: callback function, before modal will be shown
  * * completed: callback function, after modal has been shown and is visible
  * to the user.
  * * url: remote url, if this modal should be loaded from url
  *
  * @param {Function} [callback] the callback that should be triggered
  * after modal has been rendered.
  *
  * @example
  * ioco.modal('close')
  * closes the modal.
  */
  function modal( html, options ){

    function closeModal(){
      $('.ioco-modal').fadeOut(300);
      setTimeout( function(){
        $('.ioco-modal').remove();
      }, 300);
      $(window).off( 'resize', checkModalHeight );
    }

    function checkModalHeight(){
      if( $('#ioco-modal').height() > $(window).height() - 40 )
        $('#ioco-modal').animate({ height: $(window).height() - 40 }, 200);
      else
        $('#ioco-modal').animate({ height: $('#ioco-modal').data('origHeight') }, 200);
    }

    function setupModalActions(){
      if( $('#ioco-modal .modal-sidebar').length > 0 ){
        $('#ioco-modal .modal-sidebar > .sidebar-nav li').on('click', function(){
          $(this).closest('ul').find('.active').removeClass('active');
          $('#ioco-modal .sidebar-content > div').hide();
          $($('#ioco-modal .sidebar-content > div')[$(this).index()]).show();
          $(this).addClass('active');
        }).first().click();
      }
      if( options && options.completed && typeof(options.completed) === 'function' )
        setTimeout(function(){ options.completed( $('#ioco-modal') ); }, 500 );
    }

    if( html === 'close' )
      return closeModal();
    else if( typeof(html) === 'object' ){
      options = html;
      html = null;
    }

    $('.ioco-modal').remove();
    $('body').append('<div id="ioco-modal-overlay" class="ioco-modal"/>')
      .append('<div id="ioco-modal" class="ioco-modal"><div class="modal-inner-wrapper" /></div>');
    var closeModalBtn = $('<a class="close-icn">&times;</a>');
    $('#ioco-modal').prepend(closeModalBtn);
    if( options.windowControls ){
      var countWinCtrlBtns = 1;
      for( ctrl in options.windowControls ){
        var winCtrlBtn = $('<a winCtrl="'+ctrl+'" class="modal-win-ctrl live-tipsy" href="#" original-title="'+options.windowControls[ctrl].title+'"><span class="icn '+options.windowControls[ctrl].icn+'" /></a>');
        winCtrlBtn.css( { right: 16*(countWinCtrlBtns++)+32 } );
        $('#ioco-modal').prepend(winCtrlBtn);
        winCtrlBtn.on('click', function(e){
          e.preventDefault();
          options.windowControls[$(this).attr('winCtrl')].callback( $('#ioco-modal') );
        })
      }
    }
    closeModalBtn.on('click', closeModal);
    $('#ioco-modal-overlay').fadeIn(200).on('click', closeModal);
    if( options && options.title )
      $('#ioco-modal').prepend('<span class="modal-title">'+options.title+'</span>');


    // height configuration
    if( options && options.height && typeof(options.height) === 'number' )
      $('#ioco-modal').css( 'height', options.height );
    $('#ioco-modal').data('origHeight', $('#ioco-modal').height());

    checkModalHeight();
    $(window).on( 'resize', checkModalHeight );

    if( options.url ){
      $('#ioco-modal .modal-inner-wrapper').load( options.url, function(){
        if( options && options.before && typeof(options.before) === 'function' )
          options.before( $('#ioco-modal') );
        $('#ioco-modal').fadeIn( 200 );
        setupModalActions();
      });
    } else {
      html = html || options.data || options.html;
      $('#ioco-modal .modal-inner-wrapper').html( html ).fadeIn(200);
      if( options && options.before && typeof(options.before) === 'function' )
        options.before( $('#ioco-modal') );
      setupModalActions();
    }

  };

  /**
   * add a notification message to the
   * notification system
   */
  function notify( msg, type ){
    if( typeof(msg) === 'object' ){
      if( msg.error && msg.error instanceof Array && msg.error.length > 0 )
        msg.error.forEach( function( err ){
          ioco.notify( err, 'error' );
        });
      if( msg.notice && msg.notice instanceof Array && msg.notice.length > 0 )
        msg.notice.forEach( function( notice ){
          ioco.notify( notice );
        });
      return;
    }

    $.noticeAdd({
      text: msg,
      stay: (type && type !== 'notice'),
      type: type
    });
  };

  var root = this; // window of browser

  if( !root.ioco || typeof( root.ioco ) !== 'object' )
    root.ioco = {};
  root.ioco.notify = notify;
  root.ioco.modal = modal;

})();