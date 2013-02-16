# ioPageDesigner [NOT READY YET!!!!]

a javascript tool and nodejs module which lets you build design and maintain web pages
in a very intuitive way. Select bits from a library, prepare a template
set for your editors and they just fill in the bits similar to a form.

Let them edit as much as you want them to edit and keep their views clear of cryptic
coding stuff.

# Demo [soon:]

http://tastenwerk.com/iokit/io-page-designer

# Philosophy

Every tinies web content is a WebBit. Not every single html tag, but semantic logical
content. A WebBit is a visual element, let's say
a text block, a navigation bar or an image gallery. You can create such
bits - as many as you like - and use them whereever and how often you like,
place them inside each other, lock them for editors and version control them
(if implemented in the backend).

# Installation

To use inside nodejs:

    npm install iopagedesigner

To use in any other content management system:

Checkout this folder and have a look at the `demo` folder. It contains an index.html
file which should run out of the box and provide you with first steps how to integrate
ioPageDesigner in your own CMS.

Basically you won't need much more than the iokit.page-designer.min.js and it's according
stylesheet.

## Requirements

* jquery >= 1.7
* jquery ui (draggable/droppable) >= 1.8

# Usage

## Client Side

html:

    <div id="mypage">Here goes my page content</div>

javascript:

    $(document).ready( function(){
      $('#mypage').ioPageDesigner();
    });

This builds a page designer component on top of the mypage div (which gets wrapped)

## Server Side (nodejs)

In order to use pageDesigner on server side, you need to tell pageDesigner how to load
content from the db or the filesystem. Find a full working example with a file system
implementation of pageDesigner in the demo directory:


    var pageDesigner = require('iopagedesigner');

Override the loadById() interface of both WebPage and WebBit:

    pageDesigner.WebPage.loadById = function loadWebPageById( id, callback ){
      fs.readFile( __dirname+'/web_pages/'+id+'.json', function( err, jsonStr ){
        callback( null, new self( JSON.parse(jsonStr) ) );
      });
    }

    pageDesigner.WebPage.loadById = function loadWebPageById( id, callback ){
      fs.readFile( __dirname+'/web_pages/'+id+'.json', function( err, jsonStr ){
        callback( null, new self( JSON.parse(jsonStr) ) );
      });
    }
    
    pageDesigner.WebPage.loadById( 'wp1', function( myPage ){
      // render your WebPage with the myPage object
      // all nested WebBits are available starting from the 
      // myPage.rootWebBit
    });

# Contributors

* Jürgen Krausz