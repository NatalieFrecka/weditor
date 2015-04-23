function Weditor(inputElement) {
   this.inputElement = $(inputElement);
   this.click_on_control = false;
   var undoMan = new Weditor.undoManager(this.inputElement);

   this.initialize = function() {
      this.controlsElement = Weditor.ControlsManager.appendControls(inputElement);
      this.previewElement  = Weditor.PreviewManager.appendPreview(inputElement);

      this.activatePreview(this.inputElement, this.previewElement);
      this.activateControls(this.controlsElement);
      this.activateInput(this.inputElement, this.controlsElement, this.previewElement);
      this.activateKeyEvents(this.inputElement);

      this.updatePreview();
   };

   this.activateControls = function(controlsElement) {
      var _self = this;
      ["bold", "italic", "link", "quotes", "olist", "list", "heading", "pagebreak", "undo", "redo"].forEach(function(actionName) {
         $(controlsElement).find(".wedit-" + actionName).click(function(event){_self.action( actionName, event, undoMan)});
      });
   };

   this.activatePreview = function(inputElement, previewElement) {
      $(inputElement).keyup($.proxy(this.updatePreview, this));
   };

   this.activateInput = function(inputElement, controlsElement, previewElement) {
      var _self = this;

      $(controlsElement).mousedown(function() {
         _self.click_on_control = true;
      });

      $(previewElement).click(function() {
         _self.click_on_control = false;
         $(this).prev().slideDown();
         $(inputElement).focus();
         $(inputElement).select();
      });

      $(inputElement).blur(function() {
         if (!_self.click_on_control) {
            $(this).parent().slideUp();
         }
      });
   };

   this.activateKeyEvents = function(inputElement) {
      var addEvent = function(elem, event, listener) {
         if (elem.attachEvent) {
            elem.attachEvent("on" + event, listener);
         } else {
            elem.on(event, listener);
         }
      };

      addEvent(inputElement, "keydown", function(key) {
         var keyCodeMap = {"b": Weditor.Actions.bold, "i": Weditor.Actions.italic, "l": Weditor.Actions.link, 
                           "q": Weditor.Actions.quotes, "o": Weditor.Actions.olist, "u": Weditor.Actions.list, 
                           "h": Weditor.Actions.heading, "r": Weditor.Actions.pagebreak, "y": Weditor.Actions.redo,
                           "z": key.shiftKey ? Weditor.Actions.redo : Weditor.Actions.undo}

         if (key.ctrlKey || key.metaKey) {
            var keyCode = key.charCode || key.keyCode;
            var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();

            Object.keys(keyCodeMap).forEach(function(code) {
               if (keyCodeStr === code) {
                  keyCodeMap[code]($(inputElement), undoMan);
                  if (key.preventDefault) key.preventDefault();
                  if (top.event) top.event.returnValue = false;   
               }
            });
         }
      });

      addEvent(inputElement, "keyup", function(key) {
         if (!key.shiftKey && !key.ctrlKey && !key.metaKey) {
            var keyCode = key.charCode || key.keyCode;
            if (keyCode === 13) {
               Weditor.Utils.doAutoindent($(inputElement), $(inputElement).caret());
            }
         }

         //  FIX THIS. THIS IS DUMB!
         undoMan.addToStack();
      });
   };

   this.updatePreview = function() {
      var converter = new Attacklab.showdown.converter();
      $(this.previewElement).html(converter.makeHtml($(this.inputElement).val()));
      if (!$(this.inputElement).val()) {
         $(this.previewElement).css("outline", "1px dashed #FF00E1");
      } else {
         $(this.previewElement).css("outline", "none");
      }
   };

   this.action = function(actionName, event, undoManager) {
      event.preventDefault();
      Weditor.Actions[actionName]($(inputElement), undoManager);
      this.updatePreview();
   };

   this.initialize();
}

Weditor.Actions = {
   bold: function(inputElement, undoManager) {
      var selection = inputElement.caret();
      var text = $.trim(selection.text) || "strong text";
      selection.text = "**" + text + "**";
      Weditor.Utils.replaceSelection(inputElement, selection);
      Weditor.Utils.setSelection(inputElement, selection, 2, 2);
   },

   italic: function(inputElement, undoManager) {
      var selection = inputElement.caret();
      var text = $.trim(selection.text) || "italic text";
      selection.text = "*" + text + "*";
      Weditor.Utils.replaceSelection(inputElement, selection);
      Weditor.Utils.setSelection(inputElement, selection, 1, 1);
   },

   link: function(inputElement, undoManager) {
      var selection = inputElement.caret();
      var link = prompt( "Link to URL", "http://" );
      var linkNumber = inputElement.parent().next().children().first().children("a").size() + 1;
      var postfix = "\n[" + linkNumber + "]: " + link;
      if (link) {
         var text = $.trim(selection.text) || "link text";
         var endTagLength = linkNumber.toString().length + 3;
         selection.text = "[" + text + "][" + linkNumber + "]";
         Weditor.Utils.replaceSelection(inputElement, selection);
         inputElement.val(inputElement.val() + postfix);
         Weditor.Utils.setSelection(inputElement, selection, 1, endTagLength);
      }
   },

   quotes: function(inputElement, undoManager) {
      var selection = inputElement.caret();
      selection = Weditor.Utils.selectWholeLines(inputElement, selection);
      Weditor.ExtendedActions.doBlockquote(inputElement, selection, true);
   },

   olist: function(inputElement, undoManager) {
      var selection = inputElement.caret();
      selection = Weditor.Utils.selectWholeLines(inputElement, selection);
      Weditor.ExtendedActions.doList(inputElement, selection, true, true);
   },

   list: function(inputElement, undoManager) {
      var selection = inputElement.caret();
      selection = Weditor.Utils.selectWholeLines(inputElement, selection);
      Weditor.ExtendedActions.doList(inputElement, selection, false, true);
   },

   heading: function(inputElement, undoManager){
      var selection = inputElement.caret();
      var defaultText = "Heading";
      selection = Weditor.Utils.selectWholeLines(inputElement, selection);
      selection.text = selection.text || defaultText;
      var hash = (selection.text.charAt( 0 ) == "#") ? "#" : "# ";
      selection.text = hash + selection.text;
      var startTagLength = (selection.text.match(/#/g) || []).length + 1;
      Weditor.Utils.replaceSelection(inputElement, selection);
      Weditor.Utils.setSelection(inputElement, selection, startTagLength, 0);
   },

   pagebreak: function(inputElement, undoManager) {
      var selection = inputElement.caret();
      selection.text = "\n\n----------\n";
      Weditor.Utils.replaceSelection(inputElement, selection);
   },

   undo: function(inputElement, undoManager) {
      undoManager.undo();
      Weditor.PreviewManager.refreshPreview(inputElement);
   },

   redo: function(inputElement, undoManager) {
      undoManager.redo();
      Weditor.PreviewManager.refreshPreview(inputElement);
   }
}

Weditor.ExtendedActions = {
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
         if (startTag) {
            startTag = startTag.replace(/\n((>|\s)*)\n$/,
               function(totalMatch, markdown) {
                  return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
               });
         }

         if (endTag) {
            endTag = endTag.replace(/^\n((>|\s)*)\n/,
               function(totalMatch, markdown) {
                  return "\n" + markdown.replace(/^[ ]{0,3}>?[ \t]*$/gm, replacement) + "\n";
               });
         }
      };

      if (/^(?![ ]{0,3}>)/m.test(chunkText)) {
         chunkText = chunkText.replace(/^/gm, "> ");
         replaceBlanksInTags(true, startTag, endTag);
      } else {
         chunkText = chunkText.replace(/^[ ]{0,3}> ?/gm, "");
         replaceBlanksInTags(false, startTag, endTag);

         if (!/^(\n|^)[ ]{0,3}>/.test(chunkText) && startTag) {
            startTag = startTag.replace(/\n{0,2}$/, "\n\n");
         }

         if (!/(\n|^)[ ]{0,3}>.*$/.test(chunkText) && endTag) {
            endTag = endTag.replace(/^\n{0,2}/, "\n\n");
         }
      }

      if (!/\n/.test(chunkText)) {
         chunkText = chunkText.replace(/^(> *)/,
            function(wholeMatch, blanks){
               startTag += blanks;
               return "";
            });
      }

      selection.text = startTag + chunkText + endTag;
      Weditor.Utils.replaceSelection(inputElement, selection);
      Weditor.Utils.setSelection(inputElement, selection, 2, 0);
   },

   doList: function(inputElement, selection, isNumberedList, useDefaultText) {
      var previousItemsRegex = /(\n|^)(([ ]{0,3}([*+-]|\d+[.])[ \t]+.*)(\n.+|\n{2,}([*+-].*|\d+[.])[ \t]+.*|\n{2,}[ \t]+\S.*)*)\n*$/;
      var bullet = "-";
      var num = 1;
      var text = selection.text;
      var defaultText = useDefaultText ? "List item" : " ";
      var before = inputElement.val().substring(0, selection.start);
      var startTagLength = isNumberedList ? 4: 3;

      var getItemPrefix = function() {
         var prefix;
         if (isNumberedList) {
            prefix = " " + num + ". ";
            num++;
         } else {
            prefix = " " + bullet + " ";
         }

         return prefix;
      };

      var getPrefixedItem = function(itemText) {
         if (isNumberedList === undefined) {
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
         if (line.length > 0) result.push((prefix) + line.replace(/\n/g, "\n" + spaces));
      });

      selection.text = result.toString().replace(/,/g, "\n");
      Weditor.Utils.replaceSelection(inputElement, selection);
      Weditor.Utils.setSelection(inputElement, selection, startTagLength, 0)
   }
}

Weditor.ControlsManager = {
   template: 
      "<div class=\"wedit-buttons wedit-control\">" +
      "  <ul>" +
      "    <li class=\"wedit-bold\" title=\"Strong <strong> Ctrl+B\"><a class=\"wedit-icon-bold\" href=\"#wedit-bold\"><span>B</span></a></li>" +
      "    <li class=\"wedit-italic\" title=\"Emphasis <em> Ctrl+I\"><a class=\"wedit-icon-italic\" href=\"#wedit-italic\"><span>I</span></a></li>" +
      "    <li class=\"wedit-link\" title=\"Hyperlink <a> Ctrl+L\"><a class=\"wedit-icon-link\" href=\"#wedit-link\"><span>a</span></a></li>" +
      "    <li class=\"wedit-quotes\" title=\"Blockquote <blockquote> Ctrl+Q\"><a class=\"wedit-icon-quotes-left\" href=\"#wedit-quotes\"><span>q</span></a></li>" +
      "    <li class=\"wedit-olist\" title=\"Numbered List <ol> Ctrl+O\"><a class=\"wedit-icon-list-numbered\" href=\"#wedit-olist\"><span>ol</span></a></li>" +
      "    <li class=\"wedit-list\" title=\"Bulleted List <ul> Ctrl+U\"><a class=\"wedit-icon-list2\" href=\"#wedit-list\"><span>ul</span></a></li>" +
      "    <li class=\"wedit-heading\" title=\"Heading <h1>/<h2> Ctrl+H\"><a class=\"wedit-icon-font-size\" href=\"#wedit-heading\"><span>T</span></a></li>" +
      "    <li class=\"wedit-pagebreak\" title=\"Horizontal Rule <hr> Ctrl+R\"><a class=\"wedit-icon-pagebreak\" href=\"#wedit-pagebreak\"><span>hr</span></a></li>" +
      "    <li class=\"wedit-undo\" title=\"Undo - Ctrl+Z\"><a class=\"wedit-icon-undo\" href=\"#wedit-undo\"><span>z</span></a></li>" +
      "    <li class=\"wedit-redo\" title=\"Redo - Ctrl+Shift+Z\"><a class=\"wedit-icon-redo\" href=\"#wedit-redo\"><span>y</span></a></li>" +
      "  </ul>" +
      "</div>",

   appendControls: function(inputElement) {
      var element = $(Weditor.ControlsManager.template);
      $(inputElement).before(element);

      return element;
   }
}

Weditor.PreviewManager = {
   template: "<div class=\"wedit-preview wedit-control\"></div>",

   appendPreview: function(inputElement) {
      var element = $(Weditor.PreviewManager.template);
      element.css("font-size", $(inputElement).css("font-size"));
      element.css("background-color", $(inputElement).css("background-color"));
      $(inputElement).parent().after(element);

      return element;
   },

   refreshPreview: function(inputElement) {
      var converter = new Attacklab.showdown.converter();
      var preview = inputElement.parent().next();

      preview.html(converter.makeHtml(inputElement.val()));
   }
}

// Problems with undo manager:
// setInitialStack sets values from every input on page
// addToStack needs to be triggered less often. Every keyup is dumb.
// OR need to add a method that determines whether change is significant enough

Weditor.undoManager = function(inputElement) {
   var undoStack = [];
   var stackIndex = 0;

   var initialize = function() {
      undoStack.push(inputElement.val());
      console.log(undoStack)
   };

   this.addToStack = function() {
      if (undoStack[undoStack.length - 1] != inputElement.val()) {
         undoStack.push(inputElement.val());
         stackIndex++;
         console.log(undoStack)
         console.log(stackIndex)
      }
   };

   this.undo = function() {
      if (undoStack[stackIndex]) {
         stackIndex--;
         inputElement.val(undoStack[stackIndex])
         console.log(stackIndex)
      }
   };

   this.redo = function() {
      if (undoStack[stackIndex + 1]) {
         stackIndex++;
         inputElement.val(undoStack[stackIndex]);
         console.log(stackIndex)
      }
   };

   initialize();
};

Weditor.Utils = {
   doAutoindent: function(inputElement, selection) {
      var before = inputElement.val().substring(0, selection.start);
      before = before.replace(/(\n|^)[ ]{0,3}([*+-]|\d+[.])[ \t]*\n$/, "\n\n");
      before = before.replace(/(\n|^)[ ]{0,3}>[ \t]*\n$/, "\n\n");
      before = before.replace(/(\n|^)[ \t]+\n$/, "\n\n");

      if (/(\n|^)[ ]{0,3}([*+-])[ \t]+.*\n$/.test(before)) {
         Weditor.ExtendedActions.doList(inputElement, selection, false, true);
      } else if (/(\n|^)[ ]{0,3}(\d+[.])[ \t]+.*\n$/.test(before)) {
         Weditor.ExtendedActions.doList(inputElement, selection, true, true);
      } else if (/(\n|^)[ ]{0,3}>[ \t]+.*\n$/.test(before)) {
         Weditor.ExtendedActions.doBlockquote(inputElement, selection, true);
      } else {
         var after = inputElement.val().substring(selection.end);
         inputElement.val(before + selection.text + after); 
         Weditor.PreviewManager.refreshPreview(inputElement);
      }
   },

   replaceSelection: function(inputElement, selection) {
      var before = inputElement.val().substring(0, selection.start);
      var after = inputElement.val().substring(selection.end);
      inputElement.val(before + selection.text + after);
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

   setSelection: function(inputElement, selection, startTagLength, endTagLength) {
      var start = selection.start + startTagLength;
      var end = selection.start + selection.text.length - endTagLength;

      inputElement.setSelection(start, end);
      Weditor.PreviewManager.refreshPreview(inputElement);
   }
}

$(function() {
   jQuery.fn.weditThis = function() {
      this.each(function(index, inputElement) {
         var wedit = new Weditor(inputElement);
      });
   };

   $(".wedit-input").weditThis();
});

jQuery.fn.extend({
   setSelection: function(selectionStart, selectionEnd) {
      if (this.length == 0) return this;
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