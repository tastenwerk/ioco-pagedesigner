/**
* add a notification message to the
* notification system
*/
iokit.notify = function notify( msg, type ){
  if( typeof(msg) === 'object' ){
    if( msg.error && msg.error instanceof Array && msg.error.length > 0 )
      msg.error.forEach( function( err ){
        iokit.notify( err, 'error' );
      });
    if( msg.notice && msg.notice instanceof Array && msg.notice.length > 0 )
      msg.notice.forEach( function( notice ){
        iokit.notify( notice );
      });
    return;
  }

  $.noticeAdd({
    text: msg,
    stay: (type && type !== 'notice'),
    type: type
  });
};