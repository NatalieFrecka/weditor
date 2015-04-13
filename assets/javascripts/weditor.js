function Weditor(inputElement) {
  this.inputElement = inputElement;

  var keyEvent = "keydown";

  this.initialize = function(){
    this.controlsElement = Weditor.Utils.appendControls(inputElement);
    this.previewElement  = Weditor.Utils.appendPreview(inputElement);

    this.activatePreview( this.inputElement, this.previewElement );
    this.activateControls( this.controlsElement );
    this.activateInput( this.inputElement, this.controlsElement, this.previewElement );

    this.updatePreview();

    Weditor.Utils.addEvent(this.inputElement, keyEvent, function(key){
      if (key.ctrlKey || key.metaKey) {
        var keyCode = key.charCode || key.keyCode;
        var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();
        
        switch(keyCodeStr) {
          case "b":
            Weditor.Actions.bold($(inputElement));
            break;
          case "i":
            Weditor.Actions.italic($(inputElement));
            break;
          case "l":
            Weditor.Actions.link($(inputElement));
            break;
          case "q":
            // doClick(document.getElementById("wmd-quote-button"));
            console.log("QUOTE")
            break;
          case "o":
            // doClick(document.getElementById("wmd-olist-button"));
            console.log("ORDERED LIST")
            break;
          case "u":
            Weditor.Actions.list($(inputElement));
            break;
          case "h":
            Weditor.Actions.title($(inputElement));
            break;
          case "r":
            // doClick(document.getElementById("wmd-hr-button"));
            console.log("HR BREAK")
            break;
          case "y":
            // doClick(document.getElementById("wmd-redo-button"));
            console.log("REDO")
            break;
          case "z":
            if(key.shiftKey) {
              // doClick(document.getElementById("wmd-redo-button"));
              console.log("REDO")
            }
            else {
              // doClick(document.getElementById("wmd-undo-button"));
              console.log("UNDO")
            }
            break;
          default:
            return;
        }
        

        if (key.preventDefault) {
          key.preventDefault();
        }
        
        if (top.event) {
          top.event.returnValue = false;
        }
      }
    });
  };

  this.click_on_control = false;

  this.activateControls = function( controlsElement ){
    var _self = this;
    ["bold", "italic", "link", "title", "list"].forEach( function( actionName ){
      $( controlsElement ).find( ".mdm-" + actionName ).click( function( event ){ _self.action( actionName, event ) } );
    });
  };

  this.activatePreview = function( inputElement, previewElement ) {
    $(inputElement).keyup( $.proxy( this.updatePreview, this ) );
  };

  this.activateInput = function( inputElement, controlsElement, previewElement ){
    var _self = this;

    $(controlsElement).click( function(){
      _self.click_on_control = true;
    });

    $(previewElement).click( function(){
      _self.click_on_control = false;
      $(this).prev().slideDown();
      $(inputElement).focus();
      $(inputElement).select();
    });

    $(inputElement).blur( function(){
      if (!_self.click_on_control) {
        $(this).parent().slideUp();
      }
    });
  };

  this.updatePreview = function(){
    var converter = new Attacklab.showdown.converter();
    $( this.previewElement ).html(
      converter.makeHtml( $( this.inputElement ).val().replace(/</g,'&lt;').replace(/>/g,'&gt;') )
    );
  };

  this.action = function( actionName, event ){
    event.preventDefault();
    Weditor.Actions[ actionName ]( this.inputElement );
    this.updatePreview();
  };


  this.initialize();
}

/*
  The logic of each of the control buttons
*/
Weditor.Actions = {
  bold: function(inputElement){
    var selection = $(inputElement).getSelection();
    Weditor.Utils.insertAtCursor($(inputElement), selection, "**strong text**");
    $(inputElement).replaceSelection("**" + $.trim(selection.text) + "**");
  },

  italic: function(inputElement){
    var selection = $(inputElement).getSelection();
    Weditor.Utils.insertAtCursor($(inputElement), selection, "*italic text*");
    $(inputElement).replaceSelection("*" + $.trim(selection.text) + "*");
  },

  link: function(inputElement){
    var selection = $(inputElement).getSelection();
    var link = prompt( "Link to URL", "http://" );
    var linkNumber = $(inputElement).parent().next().children().first().children("a").size() + 1;
    var postfix = "\n[" + linkNumber + "]: " + link
    Weditor.Utils.insertAtCursor($(inputElement), selection, "[link text][" + linkNumber + "]");
    $(inputElement).replaceSelection( "[" + $.trim(selection.text) + "][" + linkNumber + "]");
    $(inputElement).val($(inputElement).val() + postfix);
  },

  title: function(inputElement){
    Weditor.Utils.selectWholeLines(inputElement);
    var selection = $(inputElement).getSelection();
    var hash = (selection.text.charAt( 0 ) == "#") ? "#" : "# ";
    Weditor.Utils.insertAtCursor($(inputElement), selection, hash + "Heading");
    $(inputElement).replaceSelection( hash + selection.text );
  },

  list: function( inputElement ){
    Weditor.Utils.selectWholeLines( inputElement );
    var selection = $( inputElement ).getSelection();
    var text = selection.text;
    var result = "";
    var lines = text.split( "\n" );
    for( var i = 0; i < lines.length; i++ ){
      var line = $.trim( lines[i] );
      if( line.length > 0 ) result += "- " + line + "\n";
    }

    $( inputElement ).replaceSelection( result );
  }
}

Weditor.Utils = {
  appendControls: function( inputElement ){
    var element = $( Weditor.Utils.controlsTemplate() );
    $(inputElement).before( element );

    return element;
  },

  appendPreview: function( inputElement ){
    var element = $( Weditor.Utils.previewTemplate() );
    element.css( "font-size", $( inputElement ).css( "font-size" ) );
    element.css( "background-color", $( inputElement ).css( "background-color" ) );
    $(inputElement).parent().after( element );

    return element;
  },

  insertAtCursor: function(inputElement, selection, styledText) {
    if(selection.start == selection.end) {
      var styledInput = $(inputElement).val().substring(0, selection.start) + styledText + 
                        $(inputElement).val().substring(selection.end, $(inputElement).val().length);
      $(inputElement).val(styledInput);
    }
  },

  selectWholeLines: function( inputElement ){
    var content = $( inputElement ).val();
    var selection = $( inputElement ).getSelection();
    var iniPosition = (selection.start > 0) ? (selection.start - 1) : 0;
    var endPosition = selection.end;

    while( content[iniPosition] != "\n" && iniPosition >= 0 ) {
      iniPosition--;
    }

    while( content[endPosition] != "\n" && endPosition <= content.length ) {
      endPosition++;
    }

    $( inputElement ).setSelection( iniPosition + 1, endPosition );
  },

  controlsTemplate: function(){
    var template =
      "<div class=\"mdm-buttons mdm-control\">" +
      "  <ul>" +
      "    <li class=\"mdm-bold\"><a class=\"mdm-icon-bold\" href=\"#mdm-bold\"><span>B</span></a></li>" +
      "    <li class=\"mdm-italic\"><a class=\"mdm-icon-italic\" href=\"#mdm-italic\"><span>I</span></a></li>" +
      "    <li class=\"mdm-link\"><a class=\"mdm-icon-link\" href=\"#mdm-link\"><span>a</span></a></li>" +
      "    <li class=\"mdm-quotes\"><a class=\"mdm-icon-quotes-left\" href=\"#mdm-quotes\"><span>q</span></a></li>" +
      "    <li class=\"mdm-olist\"><a class=\"mdm-icon-list-numbered\" href=\"#mdm-olist\"><span>ol</span></a></li>" +
      "    <li class=\"mdm-list\"><a class=\"mdm-icon-list2\" href=\"#mdm-list\"><span>ul</span></a></li>" +
      "    <li class=\"mdm-title\"><a class=\"mdm-icon-font-size\" href=\"#mdm-title\"><span>T</span></a></li>" +
      "    <li class=\"mdm-pagebreak\"><a class=\"mdm-icon-pagebreak\" href=\"#mdm-pagebreak\"><span>hr</span></a></li>" +
      "    <li class=\"mdm-undo\"><a class=\"mdm-icon-undo\" href=\"#mdm-undo\"><span>z</span></a></li>" +
      "    <li class=\"mdm-redo\"><a class=\"mdm-icon-redo\" href=\"#mdm-redo\"><span>y</span></a></li>" +
      "  </ul>" +
      "</div>";

    return template;
  },

  previewTemplate: function(){
    var template = "<div class=\"mdm-preview mdm-control\"></div>";

    return template;
  },

  addEvent: function(elem, event, listener){
    if (elem.attachEvent) {
      elem.attachEvent("on" + event, listener);
    }
    else {
      elem.addEventListener(event, listener, false);
    }
  }
}

$(function(){
  jQuery.fn.mdmagick = function(){
    this.each( function( index, inputElement ){
      var mdm = new Weditor( inputElement );
    });
  };

  $(".wedit-input").mdmagick();
});