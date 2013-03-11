# iocoPageDesigner (not released yet)

A powerful JavaScript web tool to build, setup, design and work with web pages in a
very intuitive manner.

iocoPageDesigner can be used as a plugin in [ioco](http://github.com/tastenwerk/ioco)
or can be build-in in any kind of CMS providing storage and view methods.

Before you continue, take a look at the demo site to get a first impression about
iocoPageDesigner: 

# Demo

http://tastenwerk.com/ioco/pageDesigner/demo

# Philosophy

Every tinies web content is a WebBit. Not every single html tag, but semantic logical
content. A WebBit is a visual element, let's say
a text block, a navigation bar or an image gallery. You can create such
bits - as many as you like - and use them whereever and how often you like,
place them inside each other, lock them for editors and version control them
(if implemented in the backend).

# Installation

## Quick standalone starting:
    
    git clone git@github.com:tastenwerk/iopagedesigner.git

copy over the /demo folder to a local or remote web server and run it. You will be
provided with a demo marked up page which does not store but gives you the opportunity
to play around with WebBits.

## Install with nodejs:
    
    npm install ioco-pagedesigner

# Integration

Basically you won't need much more than the ioco.page-designer.min.js and it's according
stylesheet. But: To get the ease of all the features of iocoPageDesigner, you should copy over
all the 3rdparty stuff (or adapt to your already build-in libraries).

## Requirements

* jquery >= 1.8
* jquery ui (draggable/droppable) >= 1.10

# Usage

## Client Side

html:

    <div id="mypage">Here goes my page content</div>

javascript:

    $(document).ready( function(){
      $('#mypage').iocoPageDesigner();
    });

This builds a page designer component on top of the mypage div (which gets wrapped)

## Server Side (nodejs)

In order to use pageDesigner on server side, you need to tell pageDesigner how to load
content from the db or the filesystem. Find a full working example with a file system
implementation of pageDesigner in the demo directory:


    var pageDesigner = require('iopagedesigner');

Override the loadById() interface of both WebPage and WebBit:

    pageDesigner.WebPage.loadById = function loadWebPageById( id, callback ){
      fs.readFile( __dirname+'/webpages/'+id+'.json', function( err, jsonStr ){
        callback( null, new self( JSON.parse(jsonStr) ) );
      });
    }

    pageDesigner.WebPage.loadById = function loadWebPageById( id, callback ){
      fs.readFile( __dirname+'/webpages/'+id+'.json', function( err, jsonStr ){
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