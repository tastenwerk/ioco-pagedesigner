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

Every <div> block is a WebBit. A WebBit is a structural connected to a plugin, which
decides the view, control mechanism and maybe also access level of the webbit. A
webpage consists of one or many WebBits. A WebBit can be reused as a libary item, a
WebPage can be configured as a template. If a new webpage is created, WebBits of the
chosen WebPage are copied into the new WebPage, so you get a fully designed (and text-filled)
Webpage.

# Features

* CRUD webpages
* multilingual support
* revision support (must be maintained on serverside)
* highly adaptable plugin system

# Who uses it?

Well, we at TASTENWERK. Our clients can be found on our webpage's portfolio site. Our own 
Website is run by ioco, ioco-web and iocoPageDesigner.

# Installation

## Quick standalone starting:
    
    git clone git@github.com:tastenwerk/ioco-pagedesigner.git

copy over the /demo folder to a local or remote web server and run it. You will be
provided with a demo marked up page which does not store but gives you the opportunity
to play around with WebBits.

## Install with nodejs (not yet):
    
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


    var pageDesigner = require('ioco-pagedesigner');

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


### Templates

With iocoPageDesigner you can create templates and reuse them. A template can be a production page
or a page just holding the template.

All the template's webbits get copied and are available as a demonstration of how the page might
look like. Text can just be modified.

### Revisions

If iocoPageDesigner is provided with the revisions: true option. This is mainly
just an interaction frontend for the server (dealing with the revisions)



# Contributors

* Jürgen Krausz