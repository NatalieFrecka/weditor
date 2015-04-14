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
            Weditor.Actions.quotes($(inputElement));
            break;
          case "o":
            Weditor.Actions.olist($(inputElement));
            break;
          case "u":
            Weditor.Actions.list($(inputElement));
            break;
          case "h":
            Weditor.Actions.title($(inputElement));
            break;
          case "r":
            Weditor.Actions.pagebreak($(inputElement));
            break;
          case "y":
            Weditor.Actions.redo($(inputElement));
            break;
          case "z":
            if(key.shiftKey) {
              Weditor.Actions.redo($(inputElement));
            }
            else {
              Weditor.Actions.undo($(inputElement));
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

    Weditor.Utils.addEvent(this.inputElement, "keyup", function(key) {
      if (!key.shiftKey && !key.ctrlKey && !key.metaKey) {
        var keyCode = key.charCode || key.keyCode;
        if (keyCode === 13) {
          Weditor.Utils.doAutoindent($(inputElement), $(inputElement).getSelection());
        }
      }
    });
  };

  this.click_on_control = false;

  this.activateControls = function( controlsElement ){
    var _self = this;
    ["bold", "italic", "link", "quotes", "title", "olist", "list", "pagebreak", "undo", "redo"].forEach( function( actionName ){
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
  bold: function(inputElement) {
    var selection = $(inputElement).getSelection();
    Weditor.Utils.insertAtCursor($(inputElement), selection, "**strong text**");
    $(inputElement).replaceSelection("**" + $.trim(selection.text) + "**");
  },

  italic: function(inputElement) {
    var selection = $(inputElement).getSelection();
    Weditor.Utils.insertAtCursor($(inputElement), selection, "*italic text*");
    $(inputElement).replaceSelection("*" + $.trim(selection.text) + "*");
  },

  link: function(inputElement) {
    var selection = $(inputElement).getSelection();
    var link = prompt( "Link to URL", "http://" );
    var linkNumber = $(inputElement).parent().next().children().first().children("a").size() + 1;
    var postfix = "\n[" + linkNumber + "]: " + link
    Weditor.Utils.insertAtCursor($(inputElement), selection, "[link text][" + linkNumber + "]");
    $(inputElement).replaceSelection("[" + $.trim(selection.text) + "][" + linkNumber + "]");
    $(inputElement).val($(inputElement).val() + postfix);
  },

  quotes: function(inputElement) {
    // Figure out what wmd "postprocessing" doing to make showdown recognize blockquote markdown
    Weditor.Utils.selectWholeLines(inputElement);
    var selection = $(inputElement).getSelection();
    Weditor.Utils.doBlockquote($(inputElement), selection, true)
  },

  title: function(inputElement){
    Weditor.Utils.selectWholeLines(inputElement);
    var selection = $(inputElement).getSelection();
    var hash = (selection.text.charAt( 0 ) == "#") ? "#" : "# ";
    Weditor.Utils.insertAtCursor($(inputElement), selection, hash + "Heading");
    $(inputElement).replaceSelection(hash + selection.text);
  },

  olist: function(inputElement) {
    // Figure out what wmd "postprocessing" to figure out how preview shows ol with numbers
    // Figure out how to handle multiple ordered lists per textarea
    Weditor.Utils.selectWholeLines(inputElement);
    var selection = $(inputElement).getSelection();
    Weditor.Utils.doList($(inputElement), selection, true, true);
  },

  list: function(inputElement) {
    Weditor.Utils.selectWholeLines(inputElement);
    var selection = $(inputElement).getSelection();
    Weditor.Utils.doList($(inputElement), selection, false, true);
  },

  pagebreak: function(inputElement) {
    var selection = $(inputElement).getSelection();
    var hRule = "\n----------\n";
    Weditor.Utils.insertAtCursor($(inputElement), selection, hRule);
    $(inputElement).replaceSelection(hRule);
  },

  undo: function(inputElement) {
    console.log("UNDO")
  },

  redo: function(inputElement) {
    console.log("REDO")
  }
}

Weditor.Utils = {
  appendControls: function(inputElement) {
    var element = $(Weditor.Utils.controlsTemplate());
    $(inputElement).before(element);

    return element;
  },

  appendPreview: function(inputElement) {
    var element = $(Weditor.Utils.previewTemplate());
    element.css("font-size", $(inputElement).css("font-size"));
    element.css("background-color", $(inputElement).css("background-color"));
    $(inputElement).parent().after(element);

    return element;
  },

  doAutoindent: function(inputElement, selection) {
    var before = $(inputElement).val().substring(0, selection.start);
    before = before.replace(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]*\n$/, "\n\n");
    before = before.replace(/(\n|^)[ ]{0,3}>[ \t]*\n$/, "\n\n");
    before = before.replace(/(\n|^)[ \t]+\n$/, "\n\n");
    
    useDefaultText = false;
    
    if(/(\n|^)[ ]{0,3}([*+-])[ \t]+.*\n$/.test(before)){
      if(Weditor.Utils.doList){
        Weditor.Utils.doList($(inputElement), selection, false, true);
      }
    }
    if(/(\n|^)[ ]{0,3}(\d+[.])[ \t]+.*\n$/.test(before)){
      if(Weditor.Utils.doList){
        Weditor.Utils.doList($(inputElement), selection, true, true);
      }
    }

    if(/(\n|^)[ ]{0,3}>[ \t]+.*\n$/.test(before)){
      if(Weditor.Utils.doBlockquote){
        Weditor.Utils.doBlockquote($(inputElement), selection, true);
      }
    }
  },

  doList: function(inputElement, selection, isNumberedList, useDefaultText) {
    var previousItemsRegex = /(\n|^)(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*$/;
    var bullet = "-";
    var num = 1;
    var text = selection.text
    var before = $(inputElement).val().substring(0, selection.start);
    
    var getItemPrefix = function() {
      var prefix;
      if(isNumberedList) {
        prefix = " " + num + ". ";
        num++;
      } else {
        prefix = " " + bullet + " ";
      }
      return prefix;
    };
    
    var getPrefixedItem = function(itemText) {
      if(isNumberedList === undefined) {
        isNumberedList = /^\s*\d/.test(itemText);
      }

      itemText = itemText.replace(/^[ ]{0,3}([*+-]|\d+[.])\s/gm,
        function(_) {
          return getItemPrefix();
        });
        
      return itemText;
    };

    before = before.replace(previousItemsRegex,
      function(itemText){
        var nLinesBefore = /[^\n]\n\n[^\n]/.test(itemText) ? 1 : 0;
        return getPrefixedItem(itemText);
      });
      
    if(selection.length === 0) {
      text = useDefaultText ? "List item" : " ";
    }

    var result = [];
    var lines = text.split("\n");

    lines.forEach(function(line) {
      line = $.trim(line);
      var prefix = getItemPrefix();
      var spaces = prefix.replace(/./g, " ");
      if(line.length > 0) result.push((prefix) + line.replace(/\n/g, "\n" + spaces));
    });

    result = result.toString().replace(/,/g, "\n");
    $(inputElement).replaceSelection(result);
    Weditor.Utils.insertAtCursor($(inputElement), selection, result);
  },

  doBlockquote: function(inputElement, selection, useDefaultText) {
    var before = $(inputElement).val().substring(0, selection.start);
    var after = $(inputElement).val().substring(selection.end, $(inputElement).val().length);

    var chunkText = selection.text.replace(/^(\n*)([^\r]+?)(\n*)$/,
      function(totalMatch, newlinesBefore, text, newlinesAfter){
        before += newlinesBefore;
        after = newlinesAfter + after;
        return text;
      });
      
    before = before.replace(/(>[ \t]*)$/,
      function(totalMatch, blankLine){
        chunkText = blankLine + chunkText;
        return "";
      });
    
    var defaultText = useDefaultText ? "Blockquote" : "";
    chunkText = chunkText.replace(/^(\s|>)+$/ ,"");
    chunkText = chunkText || defaultText;
    
    if(before){
      before = before.replace(/\n?$/,"\n");
    }
    if(after){
      after = after.replace(/^\n?/,"\n");
    }
    
    var startTag = "";
    var endTag = "";

    before = before.replace(/(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*$)/,
      function(totalMatch){
        var startTag = totalMatch;
        return "";
      });
      
    after = after.replace(/^(((\n|^)(\n[ \t]*)*>(.+\n)*.*)+(\n[ \t]*)*)/,
      function(totalMatch){
        var endTag = totalMatch;
        return "";
      });
    
    var replaceBlanksInTags = function(useBracket, startTag, endTag){
      var replacement = useBracket ? "> " : "";
      
      if(startTag){
        startTag = startTag.replace(/\n((>|\s)*)\n$/,
          function(totalMatch, markdown){
            return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
          });
      }
      if(endTag){
        endTag = endTag.replace(/^\n((>|\s)*)\n/,
          function(totalMatch, markdown){
            return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
          });
      }
    };
    
    if(/^(?![ ]{0,3}>)/m.test(chunkText)){
      // command.wrap(chunk, wmd.wmd_env.lineLength - 2);
      chunkText = chunkText.replace(/^/gm, "> ");
      replaceBlanksInTags(true, startTag, endTag);
      // chunk.addBlankLines();
    }
    else{
      chunkText = chunkText.replace(/^[ ]{0,3}> ?/gm, "");
      // command.unwrap(chunk);
      replaceBlanksInTags(false, startTag, endTag);
      
      if(!/^(\n|^)[ ]{0,3}>/.test(chunkText) && startTag){
        startTag = startTag.replace(/\n{0,2}$/, "\n\n");
      }
      
      if(!/(\n|^)[ ]{0,3}>.*$/.test(chunkText) && endTag){
        endTag = endTag.replace(/^\n{0,2}/, "\n\n");
      }
    }
    
    if(!/\n/.test(chunkText)){
      chunkText = chunkText.replace(/^(> *)/,
      function(wholeMatch, blanks){
        startTag += blanks;
        return "";
      });
    }

    var result = startTag + chunkText + endTag
    $(inputElement).replaceSelection(result);
    Weditor.Utils.insertAtCursor($(inputElement), selection, result);
  },

  insertAtCursor: function(inputElement, selection, styledText) {
    if(selection.length === 0) {
      var styledInput = $(inputElement).val().substring(0, selection.start) + styledText + 
                        $(inputElement).val().substring(selection.end, $(inputElement).val().length);
      $(inputElement).val(styledInput);
    }
  },

  selectWholeLines: function(inputElement) {
    var content = $(inputElement).val();
    var selection = $(inputElement).getSelection();
    var iniPosition = (selection.start > 0) ? (selection.start - 1) : 0;
    var endPosition = selection.end;

    while(content[iniPosition] != "\n" && iniPosition >= 0) {
      iniPosition--;
    }

    while(content[endPosition] != "\n" && endPosition <= content.length) {
      endPosition++;
    }

    $(inputElement).setSelection(iniPosition + 1, endPosition);
  },

  controlsTemplate: function() {
    var template =
      "<div class=\"mdm-buttons mdm-control\">" +
      "  <ul>" +
      "    <li class=\"mdm-bold\" title=\"Strong <strong> Ctrl+B\"><a class=\"mdm-icon-bold\" href=\"#mdm-bold\"><span>B</span></a></li>" +
      "    <li class=\"mdm-italic\" title=\"Emphasis <em> Ctrl+I\"><a class=\"mdm-icon-italic\" href=\"#mdm-italic\"><span>I</span></a></li>" +
      "    <li class=\"mdm-link\" title=\"Hyperlink <a> Ctrl+L\"><a class=\"mdm-icon-link\" href=\"#mdm-link\"><span>a</span></a></li>" +
      "    <li class=\"mdm-quotes\" title=\"Blockquote <blockquote> Ctrl+Q\"><a class=\"mdm-icon-quotes-left\" href=\"#mdm-quotes\"><span>q</span></a></li>" +
      "    <li class=\"mdm-olist\" title=\"Numbered List <ol> Ctrl+O\"><a class=\"mdm-icon-list-numbered\" href=\"#mdm-olist\"><span>ol</span></a></li>" +
      "    <li class=\"mdm-list\" title=\"Bulleted List <ul> Ctrl+U\"><a class=\"mdm-icon-list2\" href=\"#mdm-list\"><span>ul</span></a></li>" +
      "    <li class=\"mdm-title\" title=\"Heading <h1>/<h2> Ctrl+H\"><a class=\"mdm-icon-font-size\" href=\"#mdm-title\"><span>T</span></a></li>" +
      "    <li class=\"mdm-pagebreak\" title=\"Horizontal Rule <hr> Ctrl+R\"><a class=\"mdm-icon-pagebreak\" href=\"#mdm-pagebreak\"><span>hr</span></a></li>" +
      "    <li class=\"mdm-undo\" title=\"Undo - Ctrl+Z\"><a class=\"mdm-icon-undo\" href=\"#mdm-undo\"><span>z</span></a></li>" +
      "    <li class=\"mdm-redo\" title=\"Redo - Ctrl+Shift+Z\"><a class=\"mdm-icon-redo\" href=\"#mdm-redo\"><span>y</span></a></li>" +
      "  </ul>" +
      "</div>";

    return template;
  },

  previewTemplate: function() {
    var template = "<div class=\"mdm-preview mdm-control\"></div>";

    return template;
  },

  addEvent: function(elem, event, listener) {
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