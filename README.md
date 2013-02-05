# ioPageDesigner [NOT READY YET!!!!]

a javascript tool which lets you build design and maintain web pages
in a very intuitive way. Select bits from a library, preapre a template
set for your editors and they just fill in the bits similar to a form.

Let them edit as much as you want them to edit and not more they actually
want to edit.

# Philosophy

Everything is a WebBit. A WebBit is a visual element, let's say
a text block, a navigation bar or an image gallery. You can create such
bits - as many as you like - and use them whereever and how often you like,
place them inside each other, lock them for editors and version control them
(if implemented in the backend).

# Installation

To use inside nodejs:

    npm install iopagedesigner

To use in any other content management system:

Copy the files from the public folder into your own public folder.


## Requirenments

* jquery >= 1.7
* jquery ui (draggable/droppable) >= 1.8

# Demo

http://tastenwerk.com/iokit/io-page-designer

# Usage

html:
    <div id="mypage">Here goes my page content</div>

javascript:
    $(document).ready( function(){
      $('#mypage').ioPageDesigner();
    })

This builds a page designer component on top of the mypage div (which gets wrapped)