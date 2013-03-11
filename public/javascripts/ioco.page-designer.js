/**
 * iocoPageDesigner
 * extensive page designer
 *
 * (c) TASTENWERK 2013
 *
 * web: https://github.com/tastenwerk/iopagedesigner
 *
 */

( function(){

  // establish root object (window in browser, global in nodejs)
  var root = this
    , isNode = false;

  pageDesigner = {};

  /**
   * default options
   *
   */
  pageDesigner.options = {
    webBitUrl: '/webbits',
    webBitUrlData: null,
    webPageUrl: '/webpages',
    webPageUrlData: null,
    fallbackLang: 'en',
    translate: function( val ){ return val; },
    debug: 3 // 0 ... no debug at all
             // 1 ... errors on console.log
             // 2 ... warnings on console.log
             // 3 ... info on console.log
  };

  /**
   * _plugins
   *
   * internal variable. Holds all plugins
   * in an array
   */
  pageDesigner._plugins = [];

  /**
   * getPluginByName
   *
   * finds a plugin by given name
   * @param {String} [name] - the name of the plugin which
   * should be found
   *
   * @returns {object} [plugin] the plugin or nothing if not found
   *
   */
  pageDesigner.getPluginByName = function getPluginByName( name ){
    for( var i in this._plugins )
      if( this._plugins[i].name === name )
        return this._plugins[i];
  };

  /**
   * addPlugin
   *
   * adds a plugin to the _plugin system
   *
   * @param {object} [plugin] - the plugin object to 
   * be added
   *
   * a plugin can have the following keys:
   * * name (required)
   * * iconClass (optional) - an icon class defined elsewhere in css
   * * iconImg (optional) - an icon image path
   * * hoverTitle (optional) - text to be shown when hovered
   * * on.activate - function to be called when a WebBit of this plugin type is created
   * * on.init = function to be called when a WebBit of this plugin type is initialized (on load time on creation time)
   * * on.deactivate
   * * on.cleanup
   *
   * @returns itself
   *
   */
  pageDesigner.addPlugin = function addPlugin( plugin, callback ){
    if( plugin && typeof(plugin) === 'string' ){
      if( isNode ){
        if( typeof( callback ) === 'function' )
          callback( 'not supported in nodejs yet' );
        else
          return 'not supported in nodejs yet';
      } else {
        $.getScript( plugin, function(){
            if( typeof(callback) === 'function' )
              callback( null );
        });
      }
    } else {
      if( !plugin || !plugin.name || plugin.name.length < 3 )
        throw new Error('plugin must have a name key and must be of length 3 at least')
      if( this.getPluginByName( plugin.name ) )
        throw new Error('a plugin with that name already exists');
      this._plugins.push( plugin );
      return this;
    }
  }

  pageDesigner.genUUID = function pdGenUUID(){
    return new Date().getTime().toString(36);
  }

  /**
   * observe a given property
   */
  pageDesigner._processObservable = function _privateProcessObservable( property, val ){
    if( val )
      this[property] = val;
    else
      return this[property];
    // invoke jQuery refresh
  }

  /**
   * translates given value (by processing with given translation plugin)
   * default: pass value plain through function
   *
   * @param {String} [val] - the value string to be translated
   *
   */
  pageDesigner.t = pageDesigner.translate = function translate( val ){
    return pageDesigner.options.translate(val);
  }

  /**
   * define WebBit model. A WebBit is
   * the tiniest bit which can be nested
   * and collects a group of other web bits
   *
   * @param {Object} [attrs] attributes to be set for this
   * WebBit
   *
   * @param {Object} [options]
   * * lang: the default language to be selected
   * for nested web bits and meta information
   * * fallbackLang: the language to fallback if
   * the requestet language was not found. Otherwise throws an error
   * * revision: the revision to be used. If none provided or none
   * available, no revision will be used
   *
   */
  pageDesigner.WebBit = function WebBit( attrs, options ){

    options = options || {};

    Object.defineProperty( this, "renderedContent", { value: '', writable: true });
    Object.defineProperty( this, "webBits", { value: [], writable: true });
    Object.defineProperty( this, "revision", { value: options.revision || null, configurable: true });
    Object.defineProperty( this, "lang", { value: options.lang, configurable: true });
    Object.defineProperty( this, "fallbackLang", {
      value: options.fallbackLang || pageDesigner.options.fallbackLang,
      configurable: true
    });
    Object.defineProperty( this, "rolledOutLang", { value: null, configurable: true });

    if( !attrs || !attrs.pluginName )
      throw new Error('a pluginName key must be present in order to create a WebBit');

    if( !pageDesigner.getPluginByName( attrs.pluginName ) )
      throw new Error('pluginName not found in _plugins registry (' + attrs.pluginName + ')');

    if( !attrs || !attrs.name )
      throw new Error('a name key must be present in order to create a WebBit');

    for( var i in attrs ){
      this[i] = attrs[i];
      if( i === 'content' )
        this.setLang( options.lang || this.fallbackLang, { fallbackLang: this.fallbackLang } );
    }

    this.properties = this.properties || {};

  };

  /**
   * sets the language of the renderedContent object to the given parameters
   *
   * this only works, if the content is not a string, but an object with
   * language codes as keys and with the language defined
   *
   * @param {String} [lang] - the language to search for in the content object
   * @param {object} [options] - the language to fall back if lang is not present in content
   *
   * options has keys:
   * * fallbackLang - the fallback language to use
   * * force - forces the requested lang key to be created. If no language support has been enabled
   *   until now, it will be created.
   *
   */
  pageDesigner.WebBit.prototype.setLang = function setWebBitLang( lang, options ){
    Object.defineProperty( this, "lang", { value: lang });
    Object.defineProperty( this, "fallbackLang", { 
      value: options && options.fallbackLang ? options.fallbackLang : pageDesigner.options.fallbackLang 
    });

    // force
    if( options && options.force ){
      for( var i in this.webBits )
        this.webBits[i].setLang( this.lang, options );
      if( typeof(this.content) === 'object' && Object.keys(this.content).length > 0 )
        this.content[this.lang] = this.content[this.lang] || this.content[this.fallbackLang] || this.content[Object.keys(this.content)[0]];
      else{
        var tmpContent = this.content;
        this.content = {};
        this.content[ this.lang ] = typeof(tmpContent) === 'string' ? tmpContent : '';
      }
      Object.defineProperty( this, "rolledOutLang", { value: this.lang });
      return this.renderedContent = this.content[this.lang];
    }

    if( this.content && typeof(this.content) === 'object' ){
      if( this.content[this.lang] ){
        this.renderedContent = this.content[this.lang];
        Object.defineProperty( this, "rolledOutLang", { value: this.lang });
      } else if( this.content[this.fallbackLang] ){
        this.renderedContent = this.content[this.fallbackLang];
        Object.defineProperty( this, "rolledOutLang", { value: this.fallbackLang });
      }
    } else if( this.content && typeof(this.content) === 'string' ){
      this.renderedContent = this.content;
      Object.defineProperty( this, "rolledOutLang", { value: null });
    }
    if( this.webBits && this.webBits.length > 0 )
      for( var i in this.webBits )
        this.webBits[i].setLang( this.lang, this.fallbackLang );
  }

  /**
   * load a webBit by given id
   * either in browser mode by using json or
   * in server mode by using an external function (passed in by options)
   */
  pageDesigner.WebBit.loadById = function loadWebBitById( id, callback ){
    if( isNode )
      throw new Error('WebBit.loadById in NodeJS mode interface needs to be implemented by overriding this function. See documentation');
    else
      $.getJSON( pageDesigner.options.webBitUrl + '/' + id + '.json', function( json ){
                  if( pageDesigner.options.debug > 2 )
                    console.log('[pageDesigner] WebBit ', id, ' ('+json.name+')', 'loaded');
                  callback( null, new pageDesigner.WebBit( json ) );
      })
  }

  /**
   * create non-enumerable observable function
   * to allow properties to be 'observable' attached
   * to the html dom
   */
  Object.defineProperty( pageDesigner.WebBit.prototype, "observable", {
    value: function( property ){
      this[property] = '';
      Object.defineProperty( this, 'set'+property.substr(0,1).toUpperCase()+property.substr(0,property.length-1), {
        value: function( val ){  }
      });
      Object.defineProperty( this, 'get'+property.substr(0,1).toUpperCase()+property.substr(0,property.length-1), {
        value: function( val ){ pageDesigner._processObservable.call( this, property, val ); }
      });
    }
  });

  /**
   * setContent
   *
   * set the content for this webbit. This will override
   * the renderedContent attribute and create a clean
   * content string (tidied up from other WebBit content pollution)
   * initialized SubWebBits removed. This leaves e.g. one
   * single WebBit inside this WebBit form:
   *
   *     <div class="ioco-web-bit" data-id="<webBitId>">
   *       content of web bit here
   *     </div>
   *
   * into:
   *
   *     <div class="ioco-web-bit" data-id="<webBitId>"></div>
   *
   * and writes it to the content property
   *
   *
   */
  pageDesigner.WebBit.prototype.setContent = function setContentOfWebBit( val ){
    // TODO: update the content attribute
    // cleanup from tidied html code bits
    var $procContent = pageDesigner.$('<div>'+val+'</div>');
    var self = this;
    this.renderedContent = val;
    $procContent.find('[data-web-bit-id]').each(function(){
      self.webBits.push( pageDesigner.$(this).html('') );
    });
    if( typeof(this.content) === 'string' )
      return this.content = $procContent.html();
    if( typeof(this.content) === 'object' )
      this.content[this.lang || this.fallbackLang] = $procContent.html();
  };

  /**
   * read content property, reload all webbits and get a new
   * html format of this webbit
   *
   * @param {jqueryObject} [$box] - the box element to apply this
   * WebBit's content to. If no $box is given, it will be created
   * from plain
   *
   */
  pageDesigner.WebBit.prototype.render = function renderWebBit( $box ){
    if( !$box )
      $box = pageDesigner.$('<div/>');
    $box.append(this.renderedContent);
    var tmpWebBits = {};
    for( var i in this.webBits )
      tmpWebBits[this.webBits[i]._id] = this.webBits[i];

    $box.find('[data-web-bit-id]').each(function(){
      var id = pageDesigner.$(this).attr('data-web-bit-id');
      if( tmpWebBits[id] )
        pageDesigner.$(this).replaceWith( tmpWebBits[id].render( $(this) ) );
      else
        this.html('ERROR: WebBit ' + this.attr('data-web-bit-name') + ' not found');
      pageDesigner.$(this).addClass('ioco-web-bit');
    });

    if( isNode )
      return $box.toString();
    return this.decorateBox( $box );
  };

  /**
   * decorate a given box with
   * properties and action functions
   *
   * @param $box {jQuery object} [$box]
   *
   * @returns decorated $box
   *
   */
  pageDesigner.WebBit.prototype.decorateBox = function decorateBox( $box ){
    var plugin = pageDesigner.getPluginByName( this.pluginName );
    if( !plugin && pageDesigner.options.debug > 0 )
      console.log('[pageDesigner] ERROR: Plugin ', this.pluginName, 'was not found for ', this.name);

    var overwriteClasses = $box.attr('class') || '';
    if( !plugin && pageDesigner.options.debug > 0 )
      console.log('[pageDesigner] INFO: ',this.name, ' css overwrite classes found:', overwriteClasses );
    if( overwriteClasses.length < 1 )
      $box.addClass( this.properties.cssClasses );

    if( this.root )
      $box.addClass('root')
    else
      $box.prepend( pageDesigner.client.utils.renderBoxControls( plugin ) )
    $box
      .attr('data-web-bit-id',this._id)
      .attr('data-web-bit-name',this.name)
      .addClass('ioco-web-bit')
      .data('webBit', this)
      .data('plugin', pageDesigner.getPluginByName( this.pluginName ));

    if( pageDesigner.options.debug > 2 )
      console.log('[pageDesigner] INFO:', this.name, 'was successfully decorated with plugin', plugin.name);

    return this.applyActionsForBox( $box );

  }

  /**
   * setup actions for this WebBit
   *
   * @param {jquery object} [$box]
   *
   * @returns {jquery object} [$box]
   **
   */
  pageDesigner.WebBit.prototype.applyActionsForBox = function applyActionsForBox( $box ){
    return $box
      .on('mouseenter', function(e){
        e.stopPropagation();
        $('.hovered').removeClass('hovered');
        $box.addClass('hovered');
      }).on('mouseleave', function(e){
        e.stopPropagation();
        $box.removeClass('hovered');
      })
      .on('click', function(e){
        $pageDesigner = $(this).closest('.ioco-page-designer')
        if( $(e.target).hasClass('box-controls') || $(e.target).closest('.box-controls').length )
          return;
        e.stopPropagation();
        if( $box.hasClass('active') ){
          $pageDesigner.data('activeBoxId', null);
          $box.removeClass('active');
        } else {
          $('.active').removeClass('active');
          $pageDesigner.data('activeBoxId',this._id);
          $box.addClass('active');
        }
      })
      // make this box draggable
      // if dragged over a droppable box, highlight classes
      // will be calculated customized
      .draggable({ 
        handle: '.move-enabled',
        opacity: 0.3,
        cursor: 'move',
        revert: function( validDrop ){
          $('.ioco-page-designer-drop-desc').fadeOut( 300, function(){ $(this).remove() });
          if( validDrop )
            return false;
          $(document).find('.ioco-web-bit').removeClass('highlight').removeClass('highlight-left');
          return true;
        },
        drag: pageDesigner.client.utils.decorateDraggedBox
      })
      .droppable({
        accept: '.design-btn,.ioco-web-bit-from-library,.ioco-web-bit',
        tolerance: 'pointer',
        greedy: true,
        over: function( e, ui ){
          ui.draggable.data("current-droppable", $(this));
          console.log('entering', $(this), ui.draggable);
          $('.ioco-page-designer-drop-desc').remove();
          $('body').append($('<div/>').addClass('ioco-page-designer-drop-desc')
                                .attr('data-web-bit-id', $box.data('webBit').id)
                                .text($box.data('webBit').name));
        },
        out: function( e, ui ){
          $(this).removeClass('highlight').removeClass('highlight-left');
          $('.ioco-page-designer-drop-desc[data-web-bit-id='+$box.data('webBit').id+']').fadeOut( 300, function(){ $(this).remove() });
        },
        drop: pageDesigner.client.utils.droppedBox
      });
  }


  /**
   * initialize (prototype for WebBit)
   *
   * initializes all associated WebBits and applies styles
   *
   */
  pageDesigner.WebBit.prototype.initialize = function initializeWebBit( callback ){
    if( !this.content || this.content.length < 2 )
      return;
    if( typeof(callback) !== 'function' )
      throw new Error('a callback function is required for WebBit.initialize');
    var self = this;
    self.webBits = [];
    var $procContent = pageDesigner.$('<div>'+self.content+'</div>');

    var webBitIds = [];
    $procContent.find('[data-web-bit-id]').each(function(){
      webBitIds.push( pageDesigner.$(this).attr('data-web-bit-id') );
    });

    var initialized = 0
      , errors = 0;

    function initNextWebBit(){
      if( webBitIds.length === 0 || initialized > webBitIds.length - 1 )
        return callback( (errors > 0 && errors + ' WebBits could not be initialized in ' + self.name || null), self );
        pageDesigner.WebBit.loadById( webBitIds[initialized], function( err, webBit ){
          initialized++;
          if( webBit ){
            self.webBits.push( webBit );
            webBit.initialize( initNextWebBit );
          } else{
            initNextWebBit();
            errors++;
          }
        });
    }

    initNextWebBit();

  };

  /**
   * remove a WebBit from this WebBit
   *
   * @param {WebBit} [ webBit ] - the webBit which should be removed from this WebBit
   *
   * @param {function} [callback] - callback with args: err
   *
   */
  pageDesigner.WebBit.prototype.removeChild = function removeChild( webBit, callback ){
    for( var i=0, child; child=this.webBits[i]; i++ ){
      if( child._id === webBit._id ){
        this.webBits.splice(i,1);
        break; 
      }
    }
    var content = pageDesigner.$('<div/>').append(this.content);
    content.find('[data-web-bit-id='+webBit._id+']').remove();
    this.setContent( content.html() );
    if( typeof(callback) === 'function' )
      callback( null );
  }

  /**
   * define WebPage model. A WebPage is the top most root
   * component holding nested WebBits.
   *
   * @param {Object} [attrs] attributes to be set for this WebPage
   *
   * @param {Object} [options]
   * * lang: the default language to be selected
   * for nested web bits and meta information
   * * fallbackLang: the language to fallback if
   * the requestet language was not found. Otherwise throws an error
   * * revision: the revision to be used. If none provided or none
   * available, no revision will be used
   *
   */
  pageDesigner.WebPage = function WebPage( attrs, options ){

    options = options || {};

    if( !attrs || !attrs.name )
      throw new Error('a name key must be present in order to create a WebBit');

    Object.defineProperty( this, "rootWebBit", { value: {}, writable: true });
    Object.defineProperty( this, "revision", { value: options.revision, configurable: true });
    Object.defineProperty( this, "lang", { value: options.lang, configurable: true });
    Object.defineProperty( this, "fallbackLang", {
      value: options.fallbackLang || pageDesigner.options.fallbackLang,
      configurable: true
    });

    for( var i in attrs )
      this[i] = attrs[i];

    this.setLang( options.lang || this.fallbackLang );

  };

  /**
   * initialize this WebPage by calling
   * rootWebBit's initialize method
   * and recursively initialize all associated WebBits
   *
   */
  pageDesigner.WebPage.prototype.initialize = function initializeWebPage( callback ){
    var self = this;
    if( this.rootWebBitId )
      pageDesigner.WebBit.loadById( this.rootWebBitId, function( err, webBit ){ 
        if( webBit ){
          self.rootWebBit = webBit;
          self.rootWebBit.initialize( function( err, webBit ){ callback( err, self ); } );
        } else
          callback( err, self ); 
      });
    else{
      this.rootWebBit = new pageDesigner.WebBit({_id: pageDesigner.genUUID(),
                                              name: 'root web bit', 
                                              root: true, 
                                              pluginName: 'empty-container'});
      callback( null, self );
    }
  };

  /**
   * set the language of this webpage and all it's webbits
   *
   */
  pageDesigner.WebPage.prototype.setLang = function setWebPageLang( lang, options ){

    Object.defineProperty( this, "lang", { value: lang });
    Object.defineProperty( this, "fallbackLang", { 
      value: options && options.fallbackLang ? options.fallbackLang : pageDesigner.options.fallbackLang 
    });

    if( this.rootWebBit && this.rootWebBit instanceof pageDesigner.WebBit ){
      this.rootWebBit.setLang( lang, options );
    }
  }

  /**
   * set the root WebBit for this WebPage
   *
   * @param {object|string} [webBit] - the WebBit to be made root or it's id
   *
   */
  pageDesigner.WebPage.prototype.setRootWebBit = function setRootWebBit( webBit, callback ){
    var self = this;
    if( typeof( webBit ) === 'object' && webBit instanceof pageDesigner.WebBit )
      this.rootWebBitId = webBit._id;
    else if( typeof( webBit ) === 'string' )
      this.rootWebBitId = webBit;
    else
      throw new Error('webBit needs to be an instance of WebBit or String (given: ' + typeof(webBit) + ')');
    this.initialize( callback );
  };

  /**
   * read content property, reload all webbits and get a new
   * html format of this WebPage instance
   */
  pageDesigner.WebPage.prototype.render = function renderWebPage(){
    if( this.rootWebBit )
      return this.rootWebBit.render();
    return 'no root WebBit';
  }


  /**
   * load a webPage by given id
   * either in browser mode by using json or
   * in server mode by using an external function (passed in by options)
   */
  pageDesigner.WebPage.loadById = function loadWebPageById( id, callback ){
    if( pageDesigner.options.debug > 2 )
      console.log('[pageDesigner] loading WebPage', 'id:', id, 'url:', pageDesigner.options.webPageUrl);
    if( isNode )
      throw new Error('WebBit.loadById in NodeJS mode interface needs to be implemented by overriding this function. See documentation');
    else
      $.getJSON( pageDesigner.options.webPageUrl + '/' + id + '.json', function( json ){
        if( pageDesigner.options.debug > 2 )
          console.log('[pageDesigner] WebPage ', id, ' ('+json.name+')', 'loaded');
        callback( null, new pageDesigner.WebPage( json ) );
      })
  }



  //
  //
  //
  //
  //
  //
  //
  //
  // --------------------------------------------------------- client side specific code for jQuery plugin
  //
  //
  //
  //
  //
  //
  //
  //
  //


  /**
   * pageDesigner.client
   *
   * object holding jQuery plugin to build
   * $(selector).iocoPageDesigner( options );
   *
   * and its private subfunctions
   */
  pageDesigner.client = {};

  /**
   * $.fn.iocoPageDesigner( options )
   *
   * initializes a given jQuery dom object as a page designer
   * object.
   *
   * @param {Object} [options] - options for pageDesigner. See
   * documentation on http://github.com/tastenwerk/iopagedesigner/wiki
   * for usage
   */
  pageDesigner.client.jQueryPlugin = function iocoPageDesignerJQueryPlugin( options ){

    var $this = this;

    if( $this.attr('data-io-page-designer-initialized') )
      return false;
    $this.attr('data-io-page-designer-initialized', true).addClass('ioco-page-designer');

    this.options = options;
    this.utils = pageDesigner.client.utils;
    for( var i in this.utils.defaults )
      if( !options[i] )
        options[i] = this.utils.defaults[i];
    for( var i in options )
      pageDesigner.options[i] = options[i];

    $this.data('activeBoxId', null);
    this.$pageContent = $('<div/>').addClass('ioco-page-content').append( $this.html() );

    this.utils.renderToolbar.call( this );

    $this
      .html( $this.$pageContent )
      .prepend( this.$toolbar );

    this.utils.applyActionsForToolbar.call( this );

    if( options.webPage ){
      if( typeof(options.webPage) === 'string' )
        pageDesigner.WebPage.loadById( this.options.webPage, function( err, webPage ){
          if( webPage ){
            webPage.initialize( function( err, webPage ){
              options.webPage = webPage
              $this.$pageContent.append( webPage.render() );
            });
          } else
            options.notify( 'error', err );
        });
      else if( typeof( this.options.webPage ) === 'object' )
        options.webPage.initialize( function( err, webPage ){
          options.webPage = webPage
          $this.$pageContent.append( webPage.render() );
        });
    } // else
    // demo content will not be initialized

  };

  /**
   * utils namespace
   */
  pageDesigner.client.utils = {};

  /**
   * defaults
   */
  pageDesigner.client.utils.defaults = {
    webBitUrl: '/webbits',
    webPageUrl: '/webpages',
    /**
     * could be replaced with i18n-tools like
     * $.i18n.t
     */
    translate: function( val ){ return val; },
    /**
     * notification function
     *
     * default: ioco.notify
     */
    notify: typeof(ioco) === 'object' && ioco.notify || null
  };

  /**
   * toolbar
   *
   * renders iocoPageDesigner toolbar
   *
   * @public false
   *
   * @returns {String} $html code to be attached to html dom
   *
   */
  pageDesigner.client.utils.renderToolbar = function renderPageDesignerToolbar(){
    
    this.$toolbar = $('<div/>').addClass('ioco-page-designer-toolbar')
      .attr('draggable', true)
      .append(
        $('<div/>').addClass('switch-btns')
          .append($('<a/>').attr('href', '#page-designer-library').text('Bibliothek'))
          .append($('<a/>').attr('href', '#page-designer-templates').text('Vorlagen'))
          .append($('<a/>').attr('href', '#page-designer-grid').text('Grid'))
          .append($('<a/>').attr('href', '#page-designer-tools').text('Tools'))
      )
      .append(
        $('<div/>').addClass('ioco-logo draggable-handle')
      )
      .append( this.utils.renderPluginsContainer.call( this ) )
      .append( this.utils.renderFormatContainer.call( this ) )
      .append( this.utils.renderTemplatesContainer.call( this ) )
      .append( this.utils.renderLibraryContainer.call( this ) );
  };

  /**
   * renders format container
   * providing css class tools to be applied to
   * WebBits
   */
  pageDesigner.client.utils.renderFormatContainer = function renderFormatContainer(){
    var formatContainer = $('<div/>').addClass('page-designer-part').attr('id','page-designer-grid');
    return formatContainer;   
  }

  /**
   * renders templates Container
   */
  pageDesigner.client.utils.renderTemplatesContainer = function renderTemplatesContainer(){
    var templatesContainer = $('<div/>').addClass('page-designer-part').attr('id','page-designer-templates')
      .attr('data-expand-width', '150px')
      .append($('<h1>').text( pageDesigner.t('Templates') ) )
      .append($('<p class="desc">').text( pageDesigner.t('Click to turn remove all items for this page and apply desired template') ) )
      .append($('<div class="overflow-area"/>').data('subtract-from-height', 103));
    return templatesContainer;   
  }

  /**
   * renders library container
   */
  pageDesigner.client.utils.renderLibraryContainer = function renderLibraryContainer(){

   var libContainer = $('<div/>').addClass('page-designer-part').attr('id','page-designer-library')
        .attr('data-expand-width', '150px')
        .append($('<h1>').text( pageDesigner.t('Library') ))
        .append($('<p class="desc">').text( pageDesigner.t('Drag and drop items into workspace') ) )
        .append($('<div class="overflow-area"/>').data('subtract-from-height', 103));

    $.getJSON( (pageDesigner.options.webBitUrl || '/webbits') + '/library.json', function(json){
      if( json ){

        // sort the array by category
        json.sort( function(a,b){
          if( typeof( b.category ) === 'undefined' || b.category === '' || a.category < b.category )
             return -1;
          if( typeof( a.category ) === 'undefined' || a.category === '' || a.category > b.category )
            return 1;
          return 0;
        });

        var curCategory = null;
        for( var i=0,jsonWebBit; jsonWebBit=json[i]; i++ ){
          var webBit = new pageDesigner.WebBit( jsonWebBit );
          if( curCategory === null || (webBit.category !== curCategory )){
            libContainer.find('.overflow-area').append($('<h2/>').text( webBit.category || (_options.i18n ? $.i18n.t('web.page_designer.uncategorized') : 'uncategorized') ))
              .append('<ul/>');
            curCategory = webBit.category;
          }
          var li = $('<li/>')
              .addClass('ioco-web-bit-from-library').attr('data-id', webBit._id)
              .text(webBit.name)
              .data('plugin', pageDesigner.getPluginByName(webBit.pluginName))
              .data('webBit', webBit)
              .draggable({
                cursor: "move",
                appendTo: '.ioco-page-content',
                cursorAt: { top: -5, left: -5 },
                helper: function( e ) {
                  return $('<div/>').addClass('tool-helper').text(pageDesigner.t($(this).data('webBit').name));
                },
                revert: function( validDrop ){
                  if( validDrop )
                    return false;
                  return true;
                },
                drag: pageDesigner.client.utils.decorateDraggedBox
              });
          libContainer.find('ul:last').append( li );
        }
      }
    });
    return libContainer;
  }

  /**
   * plugins
   *
   * renders the plugins container inside the
   * toolbar container
   *
   * @public false
   *
   * @returns {String} $html code to be attached to html dom
   *
   */
  pageDesigner.client.utils.renderPluginsContainer = function renderPluginsContainer(){

    var $toolsContainer = $('<div/>')
      .addClass('page-designer-part')
      .attr('id','page-designer-tools');

    for( var i=0,plugin; plugin=pageDesigner._plugins[i]; i++ ){
      var pluginBtn = $('<div/>').addClass('design-btn')
                        .append($('<span/>').addClass('icn').addClass(plugin.iconClass && plugin.iconClass))
                        .data('plugin', plugin);
      if( plugin.name )
        pluginBtn.attr('title', plugin.name).addClass('tooltip-l');
      $toolsContainer.append( pageDesigner.client.utils.applyPluginActions( pluginBtn, plugin ) );
    }
    return $toolsContainer;
  };

  /**
   * apply actions for the plugin button
   */
  pageDesigner.client.utils.applyPluginActions = function applyPluginActions( $pluginBtn, plugin ){
    return $pluginBtn.draggable({
      cursor: "move",
      appendTo: '.ioco-page-content',
      cursorAt: { top: -5, left: -5 },
      helper: function( e ) {
        return $('<div/>').addClass('ioco-toolbar-plugin tool-helper').text(pageDesigner.t(plugin.name));
      },
      revert: function( validDrop ){
        if( validDrop )
          return false;
        return true;
      },
      drag: pageDesigner.client.utils.decorateDraggedBox
    })
  }

  /**
   * applies actions for toolbar
   *
   */
  pageDesigner.client.utils.applyActionsForToolbar = function applyActionsForToolbar(){
    var $toolbar = this.$toolbar;
    $toolbar
      .draggable({ handle: '.draggable-handle' })
      .find('.draggable-handle').on('dblclick', function(e){
        $toolbar.css({ right: 10, top: 10, left: 'auto' });
      }).end()
      .find('.switch-btns a').on('click', function(e){
        e.preventDefault();
        $toolbar.find('.page-designer-part').hide().end()
          .find($(this).attr('href')).fadeIn(200).end()
          .find('.switch-btns .active').removeClass('active');
        $(this).addClass('active');
        if( $toolbar.find($(this).attr('href')).attr('data-expand-width') )
          $($toolbar.addClass('expanded'));
        else
          $toolbar.removeClass('expanded');
      })
      .last().click();
  };

  /**
   * jquery-ui droppable "dropped" event resolver
   *
   * if a WebBit or Plugin is dropped over a WebBit, this event
   * is triggered
   *
   */
  pageDesigner.client.utils.droppedBox = function droppedBox( e, ui ){

    var $targetWebBit = $(this)
      , $pageContent = $targetWebBit.closest('.ioco-page-content')
      , attachMethod = null;

    if( $targetWebBit.hasClass('highlight-left') )
      if( $targetWebBit.parent('.ioco-web-bit').length > 0 )
        attachMethod = 'before';
      else
        attachMethod = 'prepend';
    else
      attachMethod = 'append';

    $(document).find('.ioco-web-bit').removeClass('highlight').removeClass('highlight-left');

    if( ui.draggable.hasClass('ioco-web-bit-from-library') || ui.draggable.hasClass('ioco-web-bit') )
      // a WebBit has been moved from the toolkit
      // library OR a rendered WebBit has been moved here
      $targetWebBit[attachMethod]( $(ui.draggable).data('webBit').render() );
    else {
      // A new WebBit is about to be created from the toolkit 
      // plugins designer bar.
      var plugin = ui.draggable.data('plugin');
      var boxName = prompt(pageDesigner.t('WebBit Name'));
      if( !boxName || boxName.length < 1 )
        return;
      var webBit = new pageDesigner.WebBit({  name: boxName, 
                                              properties: { js: '', 
                                                            cssClasses: 'float-left span1',
                                                            cssStyles: {},
                                                            library: false },
                                              pluginName: plugin.name,
                                              category: '',
                                              content: (plugin.defaultContent ? plugin.defaultContent : '') });
      $targetWebBit[attachMethod]( webBit.render() );
    }
    ui.draggable.remove();
    $('.ioco-page-designer-drop-desc').remove();
  }

  /**
   * decorate the dropped box target of this
   * draggable box with highlighters
   *
   */
  pageDesigner.client.utils.decorateDraggedBox = function decorateDraggedBox( e, ui ){
    var droppable = $(this).data('current-droppable');
    if( droppable ){
      var leftArea = Math.round(droppable.offset().left + droppable.width() / 3);
      $('.highlight').removeClass('highlight');
      $('.highlight-left').removeClass('highlight-left');
      if( e.pageX <= leftArea )
        droppable.addClass('highlight-left');
      else
        droppable.addClass('highlight');
    }
  }

  /**
   * box controls returns
   * a jquery dom with actions (close, delete, prperties) and
   * plugin functions
   *
   * @param {Object} [plugin] a plugin object
   *
   * @returns {Object} [jQueryDom] of box controls
   *
   */
  pageDesigner.client.utils.renderBoxControls = function renderBoxControls( plugin ){

    var closeBtn = $('<a/>').addClass('box-control tooltip detach-box').html('&times;')
        .attr('title', pageDesigner.options.translate('web.page_designer.detach-web_bit'))
        .on('click', function(e){
          var $box = $(e.target).closest('.ioco-web-bit')
            , $parentBox = $box.parent('.ioco-web-bit')
            , parent = $parentBox.data('webBit');
          $parentBox.data('webBit').removeChild( $box.data('webBit'), function( err ){
            if( err )
              console.log('[pageDesigner] ERROR: ', err );
            $box.remove();
          });
        });

    var saveBtn = $('<a/>').addClass('box-control save-btn tooltip')
      .attr('title', pageDesigner.options.translate('save'))
      .append($('<span/>').addClass('icn icn-save'))
      .on('click', function(e){
        options.webBit.content = options.box.find('.box-content').html();
        saveWebBit( options.box, options.webBit );
      });

    var propBtn = $('<a/>').addClass('box-control tooltip prop-btn').append($('<span/>').addClass('icn icn-properties'))
        .attr('title', pageDesigner.options.translate('web.page_designer.web_bit-properties'))
        .on('click', function(e){
          pageDesigner.client.utils.renderPropertiesModal( $(this).closest('.ioco-web-bit') );
        });

    var moveBtn = $('<a/>').addClass('box-control move-btn move-enabled tooltip')
      .append($('<span/>').addClass('icn icn-move'))
      .attr('title', pageDesigner.options.translate('web.page_designer.move'))
      .on('click', function(e){
        console.log('storing a move is not implemented yet')
      });

    var controls = $('<div/>').addClass('box-controls')
          .append(moveBtn)
          .append(propBtn);

    // add plugin
    // controls
    if( plugin.addControls && plugin.addControls instanceof Array )
      plugin.addControls.forEach( function(controlDef){
        var controlBtn = $('<a/>').addClass('box-control')
        if( controlDef.icon )
          controlBtn.append($('<span/>').addClass('icn '+controlDef.icon));
        else if( controlDef.title )
          controlBtn.text( controlDef.title )
        if( controlDef.hoverTitle )
          controlBtn.addClass('tooltip').attr('title', controlDef.hoverTitle);
        if( typeof(controlDef.action) === 'function' )
          controlBtn.on('click', function( e ){ controlDef.action( options.box, e ) });
        controls.append(controlBtn);
      });

    controls
      .append(saveBtn)
      .append(closeBtn)
      .find('.tooltip').tooltipster({ touchDevice: false });

    return controls;

  }

  /**
   * renders a properties modal
   * window supported by ioco.modal
   *
   * @param {jQueryObject} [$box] - the box the properties modal is related to
   *
   */
  pageDesigner.client.utils.renderPropertiesModal = function renderPropertiesModal( $box ){

    ioco.modal({ 
      title: pageDesigner.options.translate('web.page_designer.web_bit-properties'),
      html: pageDesigner.client.templates.propertiesModal( $box ),
      completed: function( html ){
        html.find('#cssEditor').css({ height: html.find('.sidebar-content').height() - 125});
        html.find('#htmlEditor').css({ height: html.find('.sidebar-content').height() - 65, top: 60});
        html.find('#jsEditor').css({ height: html.find('.sidebar-content').height() - 65, top: 60});
      },
      windowControls: {
        save: {
          icn: 'icn-save',
          title: pageDesigner.options.translate('web.source.save'),
          callback: function( $modal ){
            var webBit = $box.data('webBit');
            webBit.properties = webBit.properties || {};
            $box.attr('class', 'ioco-web-bit ui-droppable ui-draggable active hovered '+$modal.find('input[name=cssClasses]').val());
            var cssVal = ace.edit($modal.find('#cssEditor').get(0)).getValue();
            if( cssVal.length > 0 )
              $box.attr('css', JSON.parse(cssVal) );
            webBit.properties.libraryItem = $modal.find('input[name=libraryItem]').is(':checked');
            webBit.properties.js = ace.edit($modal.find('#jsEditor').get(0)).getValue();
            webBit.name = $modal.find('input[name=name]').val();
            webBit.category = $modal.find('input[name=category]').val();
            webBit.content = ace.edit($modal.find('#htmlEditor').get(0)).getValue();
            webBit.properties.cssClasses = $modal.find('#cssClasses').val();
            // TODO: webBit.save();
          }
        }
      }
    });

  }

  /**
   * helper
   */
  pageDesigner.client.helper = {};

  /**
   * reads out all css properties of an object
   * and returns a jquery compatible css object
   * which can be passed into another object
   *
   * from: http://upshots.org/javascript/jquery-get-currentstylecomputedstyle
   * author: unknown (site does not mention any author name)
   *
   * @param {Object} [dom] - a dom (not jQuery!) object
   * 
   */
  pageDesigner.client.helper.getStyles = function( dom ){
    var style;
    var returns = {};
    if(window.getComputedStyle){
        var camelize = function(a,b){
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
        for(var i = 0, l = style.length; i < l; i++){
            var prop = style[i];
            var camel = prop.replace(/\-([a-z])/, camelize);
            var val = style.getPropertyValue(prop);
            returns[camel] = val;
        };
        return returns;
    };
    if(style = dom.currentStyle){
        for(var prop in style){
            returns[prop] = style[prop];
        };
        return returns;
    };
    if(style = dom.style){
        for(var prop in style){
            if(typeof style[prop] != 'function'){
                returns[prop] = style[prop];
            }
        }
        return returns;
    }
    return returns;
  }

  /**
   * templates
   */
  pageDesigner.client.templates = {};

  /**
   * propertiesModal
   *
   * content for the modal dialog sticked together by iterating
   * through plugins
   */
  pageDesigner.client.templates.propertiesModal = function( $box ){

    var webBit = $box.data('webBit')
      , plugin = $box.data('plugin');

    if( typeof(ace) === 'object' ){
      ace.config.set("modePath", "/javascripts/3rdparty/ace");
      ace.config.set("workerPath", "/javascripts/3rdparty/ace");
      ace.config.set("themePath", "/javascripts/3rdparty/ace");
    }

    var cssDiv = $('<div class="web-bit-props"/>')
                  .append($('<h1 class="title"/>').text('Style definitions'))
                  .append($('<p/>')
                    .append($('<label/>').text('CSS Classes'))
                    .append('<br />')
                    .append($('<input type="text" name="cssClasses" placeholder="e.g.: span2 float-left" value="'+
            $box.attr('class').replace(/[\ ]*ioco-web-bit|ui-droppable|ui-draggable|active|hovered[\ ]*/g,'')+'" />'))
                  ).append($('<p/>')
                    .append($('<label/>').text('CSS Rules for the box (not for children) in JSON notation'))
                    .append('<br />')
                    .append($('<div id="cssEditor" class="ace-editor"/>'))
                  );

    // set ace editor for textareas if ace option is enabled
    if( typeof(ace) === 'object' ){
      aceEditor = ace.edit( cssDiv.find('#cssEditor').get(0) );
      aceEditor.getSession().setMode("ace/mode/json");
      aceEditor.getSession().setUseWrapMode(true);
      aceEditor.getSession().setWrapLimitRange(80, 80);
      if( webBit.properties && webBit.properties.styles )
        aceEditor.setValue( JSON.stringify( webBit.properties.styles, null, 4 ) )
      //aceEditor.setValue( JSON.stringify(pageDesigner.client.helper.getStyles( $box.get(0) ), null, 4) );
    }

    var htmlDiv = $('<div class="web-bit-props"/>')
                  .append($('<h1 class="title"/>').text('HTML'))
                  .append($('<p/>')
                    .append($('<label/>').text('edit the html source'))
                    .append('<br />')
                    .append($('<div id="htmlEditor" class="ace-editor" />'))
                  );

    var metaDiv = $('<div class="web-bit-props"/>')
                  .append($('<h1 class="title"/>').text('META'))
                  .append($('<p/>')
                    .append($('<label/>').text( pageDesigner.options.translate('name') ) )
                    .append('<br />')
                    .append($('<input type="text" name="name" class="fill-width" />').val( webBit.name ))
                  )
                  .append($('<p/>')
                    .append($('<input type="checkbox" name="libraryItem" />').attr('checked', webBit.properties.libraryItem))
                    .append($('<label/>').text( pageDesigner.options.translate('web.page_designer.library') ) )
                  )
                  .append($('<p/>')
                    .append($('<label/>').text( pageDesigner.options.translate('web.page_designer.category') ) )
                    .append('<br />')
                    .append($('<input type="text" name="category" class="fill-width" />').val( webBit.category ))
                  );

    // set ace editor for textareas if ace option is enabled
    if( typeof(ace) === 'object' ){
      aceEditor = ace.edit( htmlDiv.find('#htmlEditor').get(0) );
      aceEditor.getSession().setMode("ace/mode/html");
      aceEditor.getSession().setUseWrapMode(true);
      aceEditor.getSession().setWrapLimitRange(80, 80);
      if( webBit.content )
        aceEditor.setValue( webBit.content );
    }

    var jsDiv = $('<div class="web-bit-props"/>')
                  .append($('<h1 class="title"/>').text('Javascript'))
                  .append($('<p/>')
                    .append($('<label/>').text('Custom Code. Available vars: $box (this box jquery dom object)'))
                    .append('<br />')
                    .append($('<div id="jsEditor" class="ace-editor" />'))
                  );

    // set ace editor for textareas if ace option is enabled
    if( typeof(ace) === 'object' ){
      aceEditor = ace.edit( jsDiv.find('#jsEditor').get(0) );
      aceEditor.getSession().setMode("ace/mode/javascript");
      aceEditor.getSession().setUseWrapMode(true);
      aceEditor.getSession().setWrapLimitRange(80, 80);
      if( webBit.properties.js )
        aceEditor.setValue( webBit.properties.js );
    }

    var revisionsDiv = $('<div class="web-bit-props"/>')
                  .append($('<h1 class="title"/>').text('Revisions'));

    var accessDiv = $('<div class="web-bit-props"/>')
                  .append($('<h1 class="title"/>').text('ACL'));

    var sidebar = $('<ul class="sidebar-nav"/>')
        .append($('<li/>').text( 'HTML' ))
        .append($('<li/>').text( pageDesigner.options.translate('web.page_designer.meta') ) )
        .append($('<li/>').text( 'CSS' ))
        .append($('<li/>').text( 'JS' ));

    var sidebarContent = $('<div class="sidebar-content"/>')
        .append(htmlDiv)
        .append(metaDiv)
        .append(cssDiv)
        .append(jsDiv)

    if( plugin.addProperties && plugin.addProperties instanceof Array )
      for( var i=0,propertyPlugin; propertyPlugin=plugin.addProperties[i]; i++ ){
        sidebar.append($('<li/>').text( propertyPlugin.title ));
        if( propertyPlugin.html )
          sidebarContent.append( $('<div class="web-bit-props">').html(propertyPlugin.html) );
        else if( propertyPlugin.remoteHtml )
          $.get( propertyPlugin.remoteHtml, function( html ){
            sidebarContent.append( $('<div class="web-bit-props">').html(html) );
          });
      }

    sidebar
      .append($('<li/>').text( 'Revisions' ))
      .append($('<li/>').text( 'Access' ))

    sidebarContent
      .append(revisionsDiv)
      .append(accessDiv)
      
    var html = $('<div class="modal-sidebar"/>')
      .append(sidebar)
      .append(sidebarContent);
    
    return html;
  }

  // --------------------------------------------------------- main export server/client

  // expose pageDesigner to the global namespace
  // or export it if within nodejs
  //
  if (typeof(module) !== 'undefined' && module.exports) {
    // nodejs

    // provide a jquery parser to pageDesigner. This is required
    // in order to use the same parsing function as in the browser
    // on server side.
    cheerio = require('cheerio');
    pageDesigner.$ = cheerio;
    module.exports = pageDesigner;
    isNode = true;
  } else {
    if( !root.ioco || typeof( root.ioco ) !== 'object' )
      root.ioco = {};
    root.ioco.pageDesigner = pageDesigner;
    pageDesigner.$ = jQuery;
    jQuery.fn.iocoPageDesigner = pageDesigner.client.jQueryPlugin;
  }

})();