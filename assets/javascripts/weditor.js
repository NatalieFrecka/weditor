function Weditor(inputElement) {
  this.inputElement = inputElement;

  this.initialize = function(){
    this.controlsElement = Weditor.Utils.appendControls(inputElement);
    this.previewElement  = Weditor.Utils.appendPreview(inputElement);

    this.activatePreview( this.inputElement, this.previewElement );
    this.activateControls( this.controlsElement );
    this.activateInput( this.inputElement, this.controlsElement, this.previewElement );

    this.updatePreview();

    Weditor.Utils.addEvent(this.inputElement, "keydown", function(key){
      if (key.ctrlKey || key.metaKey) {
        var keyCode = key.charCode || key.keyCode;
        var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();
        
        switch(keyCodeStr) {
          case "b":
            Weditor.Actions.bold(inputElement);
            break;
          case "i":
            Weditor.Actions.italic(inputElement);
            break;
          case "l":
            Weditor.Actions.link(inputElement);
            break;
          case "q":
            Weditor.Actions.quotes(inputElement);
            break;
          case "o":
            Weditor.Actions.olist(inputElement);
            break;
          case "u":
            Weditor.Actions.list(inputElement);
            break;
          case "h":
            Weditor.Actions.title(inputElement);
            break;
          case "r":
            Weditor.Actions.pagebreak(inputElement);
            break;
          case "y":
            Weditor.Actions.redo(inputElement);
            break;
          case "z":
            if(key.shiftKey) {
              Weditor.Actions.redo(inputElement);
            }
            else {
              Weditor.Actions.undo(inputElement);
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
          Weditor.Utils.doAutoindent($(inputElement), $(inputElement).caret());
        }
      }
    });
  };

  this.click_on_control = false;

  this.activateControls = function( controlsElement ){
    var _self = this;
    ["bold", "italic", "link", "quotes", "title", "olist", "list", "pagebreak", "undo", "redo"].forEach( function( actionName ){
      $(controlsElement ).find( ".mdm-" + actionName ).click( function( event ){ _self.action( actionName, event ) } );
    });
  };

  this.activatePreview = function( inputElement, previewElement ) {
    $(inputElement).keyup($.proxy(this.updatePreview, this));
  };

  this.activateInput = function( inputElement, controlsElement, previewElement ){
    var _self = this;

    $(controlsElement).mousedown(function(){
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

// Test this
  this.updatePreview = function(){
    var converter = new Attacklab.showdown.converter();
    $( this.previewElement ).html(
      converter.makeHtml( $( this.inputElement ).val())
    );
  };

  this.action = function( actionName, event ){
    event.preventDefault();
    Weditor.Actions[ actionName ]( this.inputElement );
    this.updatePreview();
  };

  this.initialize();
}

Weditor.Actions = {
  bold: function(inputElement) {
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    selection.text = "**" + $.trim(selection.text) + "**";
    Weditor.Utils.replaceSelection(inputElement, selection);
    Weditor.Utils.insertAtCursor(inputElement, selection, "**strong text**");
    Weditor.Utils.refreshPreview(inputElement);
  },

  italic: function(inputElement) {
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    selection.text = "*" + $.trim(selection.text) + "*"
    Weditor.Utils.replaceSelection(inputElement, selection);
    Weditor.Utils.insertAtCursor(inputElement, selection, "*italic text*");
    Weditor.Utils.refreshPreview(inputElement);
  },

  link: function(inputElement) {
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    var link = prompt( "Link to URL", "http://" );
    var linkNumber = inputElement.parent().next().children().first().children("a").size() + 1;
    var postfix = "\n[" + linkNumber + "]: " + link
    if(link) {
      selection.text = "[" + $.trim(selection.text) + "][" + linkNumber + "]"
      Weditor.Utils.replaceSelection(inputElement, selection);
      Weditor.Utils.insertAtCursor(inputElement, selection, "[link text][" + linkNumber + "]");
      inputElement.val(inputElement.val() + postfix);
      Weditor.Utils.refreshPreview(inputElement);
    }
  },

  quotes: function(inputElement) {
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    selection = Weditor.Utils.selectWholeLines(inputElement, selection);
    Weditor.Utils.doBlockquote(inputElement, selection, true);
    Weditor.Utils.refreshPreview(inputElement);
  },

  title: function(inputElement){
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    var defaultText = "Heading";
    selection = Weditor.Utils.selectWholeLines(inputElement, selection);
    selection.text = selection.text || defaultText;
    var hash = (selection.text.charAt( 0 ) == "#") ? "#" : "# ";
    selection.text = hash + selection.text;
    Weditor.Utils.replaceSelection(inputElement, selection);
    Weditor.Utils.refreshPreview(inputElement);
  },

  olist: function(inputElement) {
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    selection = Weditor.Utils.selectWholeLines(inputElement, selection);
    Weditor.Utils.doList(inputElement, selection, true, true);
    Weditor.Utils.refreshPreview(inputElement);
  },

  list: function(inputElement) {
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    selection = Weditor.Utils.selectWholeLines(inputElement, selection);
    Weditor.Utils.doList(inputElement, selection, false, true);
    Weditor.Utils.refreshPreview(inputElement);
  },

  pagebreak: function(inputElement) {
    var inputElement = $(inputElement);
    var selection = inputElement.caret();
    selection.text = "\n\n----------\n";
    Weditor.Utils.replaceSelection(inputElement, selection);
    Weditor.Utils.insertAtCursor(inputElement, selection, selection.text);
    Weditor.Utils.refreshPreview(inputElement);
  },

  undo: function(inputElement) {
    alert("Undo is not yet functional");
    console.log("UNDO")
  },

  redo: function(inputElement) {
    alert("Redo is not yet functional");
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

  replaceSelection: function(inputElement, selection) {
    if(selection.start != selection.end) {
      var before = $(inputElement).val().substring(0, selection.start);
      var after = $(inputElement).val().substring(selection.end);
      $(inputElement).val(before + selection.text + after);
    }
  },

  doAutoindent: function(inputElement, selection) {
    // Copy wmd's way ending the auto-indent
    var before = $(inputElement).val().substring(0, selection.start);
    before = before.replace(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]*\n$/, "\n\n");
    before = before.replace(/(\n|^)[ ]{0,3}>[ \t]*\n$/, "\n\n");
    before = before.replace(/(\n|^)[ \t]+\n$/, "\n\n");
    
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


    Weditor.Utils.refreshPreview($(inputElement));
  },

  doList: function(inputElement, selection, isNumberedList, useDefaultText) {
    var previousItemsRegex = /(\n|^)(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*$/;
    var bullet = "-";
    var num = 1;
    var text = selection.text;
    var defaultText = useDefaultText ? "List item" : " ";
    var before = inputElement.val().substring(0, selection.start);
    
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
    
    text = text || defaultText;

    var result = [];
    var lines = text.split("\n");

    lines.forEach(function(line) {
      line = $.trim(line);
      var prefix = getItemPrefix();
      var spaces = prefix.replace(/./g, " ");
      if(line.length > 0) result.push((prefix) + line.replace(/\n/g, "\n" + spaces));
    });

    selection.text = result.toString().replace(/,/g, "\n");
    Weditor.Utils.replaceSelection(inputElement, selection);
    Weditor.Utils.insertAtCursor(inputElement, selection, selection.text);
  },

  doBlockquote: function(inputElement, selection, useDefaultText) {
    var before = inputElement.val().substring(0, selection.start);
    var after = inputElement.val().substring(selection.end);
    var chunkText = selection.text.replace(/^(\s|>)+$/ ,"");
    var defaultText = useDefaultText ? "Blockquote" : "";
    var startTag = "";
    var endTag = "";

    chunkText = chunkText || defaultText;
    
    var replaceBlanksInTags = function(useBracket, startTag, endTag) {
      var replacement = useBracket ? "> " : "";
      if(startTag) {
        startTag = startTag.replace(/\n((>|\s)*)\n$/,
          function(totalMatch, markdown) {
            return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
          });
      }

      if(endTag) {
        endTag = endTag.replace(/^\n((>|\s)*)\n/,
          function(totalMatch, markdown) {
            return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
          });
      }
    };
    
    if(/^(?![ ]{0,3}>)/m.test(chunkText)) {
      chunkText = chunkText.replace(/^/gm, "> ");
      replaceBlanksInTags(true, startTag, endTag);
    } else {
      chunkText = chunkText.replace(/^[ ]{0,3}> ?/gm, "");
      replaceBlanksInTags(false, startTag, endTag);
      
      if(!/^(\n|^)[ ]{0,3}>/.test(chunkText) && startTag) {
        startTag = startTag.replace(/\n{0,2}$/, "\n\n");
      }
      
      if(!/(\n|^)[ ]{0,3}>.*$/.test(chunkText) && endTag) {
        endTag = endTag.replace(/^\n{0,2}/, "\n\n");
      }
    }
    
    if(!/\n/.test(chunkText)) {
      chunkText = chunkText.replace(/^(> *)/,
      function(wholeMatch, blanks){
        startTag += blanks;
        return "";
      });
    }

    selection.text = startTag + chunkText + endTag;
    Weditor.Utils.replaceSelection(inputElement, selection);
    Weditor.Utils.insertAtCursor(inputElement, selection, selection.text);
  },

  insertAtCursor: function(inputElement, selection, styledText) {
    if(selection.start === selection.end) {
      var styledInput = $(inputElement).val().substring(0, selection.start) + styledText + 
                        $(inputElement).val().substring(selection.end);
      $(inputElement).val(styledInput);
    }
  },

  selectWholeLines: function(inputElement, selection) {
    var content = inputElement.val();
    var iniPosition = (selection.start > 0) ? (selection.start - 1) : 0;
    var endPosition = selection.end;

    while(content[iniPosition] != "\n" && iniPosition >= 0) {
      iniPosition--;
    }

    while(content[endPosition] != "\n" && endPosition <= content.length) {
      endPosition++;
    }

    selection.start = iniPosition + 1;
    selection.end = endPosition;
    selection.text = inputElement.val().substring(selection.start, selection.end);

    return selection;
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

  refreshPreview: function(inputElement) {
    var converter = new Attacklab.showdown.converter();
    var preview = $(inputElement).parent().next();

    $(preview).html(converter.makeHtml($(inputElement).val()));
  },

  addEvent: function(elem, event, listener) {
    if (elem.attachEvent) {
      elem.attachEvent("on" + event, listener);
    } else {
      $(elem).on(event, listener);
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

jQuery.fn.extend({
  setSelection: function(selectionStart, selectionEnd) {
    if(this.length == 0) return this;
    input = this[0];

    if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    } else if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    }

    return this;
  }
});