describe("Weditor", function() {
   beforeEach(function() {
      $("body").append(
      '<div id="fragment">' +
      '	<div class="weditor-container">' +
      '		<div class="weditor">' +
      '			<textarea class="wedit-input" id="it"></textarea>' +
      '		</div>' +
      '	</div>' +
      '</div>'
      );
   });

   afterEach(function () {
      $("#fragment").remove();
   });

   describe("on initialization", function() {
      beforeEach(function() {
         $("#it").weditThis();
      });

      it("should append the preview right after the wedit-inputs parent", function() {
         expect($(".weditor").next().prop("class")).toBe("wedit-preview wedit-control");
      });

      it("should prepend the button bar before the wedit-input", function() {
         expect($("#it").prev().prop("class")).toBe("wedit-buttons wedit-control");
      });

      it("should show the preview", function() {
         expect($(".wedit-preview").is(":visible")).toBe(true);
      });

      it("should hide the wedit-input", function() {
         expect($("#it").is(":visible")).toBe(false);
      });

      it("should hide the button bar", function() {
         expect($(".wedit-buttons").is(":visible")).toBe(false);
      });

      describe("clicking the preview box", function() {
         beforeEach(function() {
            spyOn(jQuery.fn, "setSelection");
            $(".wedit-preview").click();
         });

         it("should show the wedit-input", function() {
            expect($("#it").is(":visible")).toBe(true);
         });

         it("should show the button bar", function() {
            expect($(".wedit-buttons").is(":visible")).toBe(true);
         });

         describe("wedit-input on blur", function() {
            beforeEach(function() {
               jQuery.fx.off = true;
               $("#it").blur();
            });

            it("should still show the preview div", function() {
               expect($(".wedit-preview").is(":visible")).toBe(true);
            });

            it("should hide the wedit-input", function() {
               expect($("#it").is(":visible")).toBe(false);
            });

            it("should hide the button bar", function() {
               expect($(".wedit-buttons").is(":visible")).toBe(false);
            });
         });

         describe("when Bold button is clicked with no selection", function() {
            beforeEach(function() {
               $(".wedit-bold").click();
            });

            it("should insert the defaulted bold text at the cursor", function() {
               expect($("#it").val()).toBe("**strong text**");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe("<p><strong>strong text</strong></p>");
            });

            it("should call setSelection with the correct args", function() {
               expect(jQuery.fn.setSelection).toHaveBeenCalledWith(2, 13);
            });
         });

         describe("when Italics button is clicked with no selection", function() {
            beforeEach(function() {
               $(".wedit-italic").click();
            });

            it("should insert the default italic text at cursor", function() {
               expect($("#it").val()).toBe("*italic text*");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe("<p><em>italic text</em></p>");
            });

            it("should call setSelection with the correct args", function() {
               expect(jQuery.fn.setSelection).toHaveBeenCalledWith(1, 12);
            });
         });

         describe("when Link button is clicked with no selection", function() {
            beforeEach(function() {
               spyOn(window, 'prompt').and.returnValue("http://www.google.com");
               $(".wedit-link").click();
            });

            it("should insert the default link text at cursor", function() {
               expect($("#it").val()).toBe("[link text][1]\n[1]: http://www.google.com");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe('<p><a href="http://www.google.com">link text</a></p>');
            });

            it("should call setSelection with the correct args", function() {
               expect(jQuery.fn.setSelection).toHaveBeenCalledWith(1, 10);
            });

            describe("when a second link is added", function() {
               beforeEach(function() {
                  spyOn(jQuery.fn, "caret").and.returnValue({start: 14, end: 14, text: ""});
                  $(".wedit-link").click();
               });

               it("should insert the default link text at cursor", function() {
                  expect($("#it").val()).toBe("[link text][1][link text][2]\n[1]: http://www.google.com\n[2]: http://www.google.com");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<p><a href="http://www.google.com">link text</a><a href="http://www.google.com">link text</a></p>');
               });
            });
         });

         describe("when Quotes button is clicked with no selection", function() {
            beforeEach(function() {
               $(".wedit-quotes").click();
            });

            it("should insert the default quote text at cursor", function() {
               expect($("#it").val()).toBe("> Blockquote");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe("<blockquote>\n  <p>Blockquote</p>\n</blockquote>");
            });

            it("should call setSelection with the correct args", function() {
               expect(jQuery.fn.setSelection).toHaveBeenCalledWith(2, 12);
            });
         });

         describe("when Ordered List button is clicked with no selection", function() {
            beforeEach(function() {
               $(".wedit-olist").click();
            });

            it("should insert the default ordered list text at cursor", function() {
               expect($("#it").val()).toBe(" 1. List item");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe('<ol>\n<li>List item</li>\n</ol>');
            });

            it("should call setSelection with the correct args", function() {
               expect(jQuery.fn.setSelection).toHaveBeenCalledWith(4, 13);
            });

            describe("a second list item is added", function() {
               beforeEach(function() {
                  spyOn(jQuery.fn, "caret").and.returnValue({start: 14, end: 14, text: ""});
                  $("#it").val($("#it").val() + "\n");
                  $(".wedit-olist").click();
               });

               it("should add a second list item with the correct prefix", function() {
                  expect($("#it").val()).toBe(" 1. List item\n 2. List item");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<ol>\n<li>List item</li>\n<li>List item</li>\n</ol>');
               });
            });
         });

         describe("when Unordered List button is clicked with no selection", function() {
            beforeEach(function() {
               $(".wedit-list").click();
            });

            it("should insert the default unordered list text at cursor", function() {
               expect($("#it").val()).toBe(" - List item");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe('<ul>\n<li>List item</li>\n</ul>');
            });

            it("should call setSelection with the correct args", function() {
               expect(jQuery.fn.setSelection).toHaveBeenCalledWith(3, 12);
            });

            describe("a second list item is added", function() {
               beforeEach(function() {
                  spyOn(jQuery.fn, "caret").and.returnValue({start: 13, end: 13, text: ""});
                  $("#it").val($("#it").val() + "\n");
                  $(".wedit-list").click();
               });

               it("should add a second list item with the correct prefix", function() {
                  expect($("#it").val()).toBe(" - List item\n - List item");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<ul>\n<li>List item</li>\n<li>List item</li>\n</ul>');
               });
            });
         });

         describe("when Heading button is clicked with no selection", function() {
            beforeEach(function() {
               $(".wedit-heading").click();
            });

            it("should insert the default header text at cursor", function() {
               expect($("#it").val()).toBe("# Heading");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe('<h1>Heading</h1>');
            });

            it("should call setSelection with the correct args", function() {
               expect(jQuery.fn.setSelection).toHaveBeenCalledWith(2, 9);
            });

            describe("when Heading button is clicked second time", function() {
               beforeEach(function() {
                  $(".wedit-heading").click();
               });

               it("should add second hash symbol", function() {
                  expect($("#it").val()).toBe("## Heading");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<h2>Heading</h2>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(3, 10);
               });
            });
         });

         describe("when Pagebreak button is clicked with no selection", function() {
            beforeEach(function() {
               $(".wedit-pagebreak").click();
            });

            it("should insert the default page break text at cursor", function() {
               expect($("#it").val()).toBe("\n\n----------\n");
            });

            it("should update the preview div", function() {
               expect($(".wedit-preview").html()).toBe('<hr>');
            });
         });

         describe("when text is selected", function() {
            beforeEach(function() {
               $("#it").val("Default Text not selected")
               spyOn(jQuery.fn, "caret").and.returnValue({start: 0, end: 12, text: "Default Text"});
            });

            describe("when Bold button is clicked", function() {
               beforeEach(function() {
                  $(".wedit-bold").click();
               });

               it("should bold the selected text", function() {
                  expect($("#it").val()).toBe("**Default Text** not selected");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<p><strong>Default Text</strong> not selected</p>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(2, 14);
               });
            });

            describe("when Italics button is clicked", function() {
               beforeEach(function() {
                  $(".wedit-italic").click();
               });

               it("should italicize the selected text", function() {
                  expect($("#it").val()).toBe("*Default Text* not selected");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<p><em>Default Text</em> not selected</p>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(1, 13);
               });
            });

            describe("when Link button is clicked", function() {
               beforeEach(function() {
                  spyOn(window, 'prompt').and.returnValue("http://www.google.com");
                  $(".wedit-link").click();
               });

               it("should use the selected text as link text and add the link ref at the end of the input text", function() {
                  expect($("#it").val()).toBe("[Default Text][1] not selected\n[1]: http://www.google.com");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<p><a href="http://www.google.com">Default Text</a> not selected</p>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(1, 13);
               });
            });

            describe("when Quotes button is clicked", function() {
               beforeEach(function() {
                  $(".wedit-quotes").click();
               });

               it("should make the whole line a block quote", function() {
                  expect($("#it").val()).toBe("> Default Text not selected");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<blockquote>\n  <p>Default Text not selected</p>\n</blockquote>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(2, 27);
               });
            });

            describe("when Ordered List button is clicked", function() {
               beforeEach(function() {
                  $(".wedit-olist").click();
               });

               it("should make the whole line a list item", function() {
                  expect($("#it").val()).toBe(" 1. Default Text not selected");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<ol>\n<li>Default Text not selected</li>\n</ol>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(4, 29);
               });
            });

            describe("when Unordered List button is clicked", function() {
               beforeEach(function() {
                  $(".wedit-list").click();
               });

               it("should make the whole line a list item", function() {
                  expect($("#it").val()).toBe(" - Default Text not selected");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<ul>\n<li>Default Text not selected</li>\n</ul>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(3, 28);
               });
            });

            describe("when Heading button is clicked", function() {
               beforeEach(function() {
                  $(".wedit-heading").click();
               });

               it("should add a hash to the whole line", function() {
                  expect($("#it").val()).toBe("# Default Text not selected");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<h1>Default Text not selected</h1>');
               });

               it("should call setSelection with the correct args", function() {
                  expect(jQuery.fn.setSelection).toHaveBeenCalledWith(2, 27);
               });

               describe("when Heading button is clicked second time", function() {
                  beforeEach(function() {
                     $(".wedit-heading").click();
                  });

                  it("should add second hash symbol", function() {
                     expect($("#it").val()).toBe("## Default Text not selected");
                  });

                  it("should update the preview div", function() {
                     expect($(".wedit-preview").html()).toBe('<h2>Default Text not selected</h2>');
                  });

                  it("should call setSelection with the correct args", function() {
                     expect(jQuery.fn.setSelection).toHaveBeenCalledWith(3, 28);
                  });
               });
            });

            describe("when Pagebreak button is clicked", function() {
               beforeEach(function() {
                  $(".wedit-pagebreak").click();
               });

               it("should replace the text with a page break", function() {
                  expect($("#it").val()).toBe("\n\n----------\n not selected");
               });

               it("should update the preview div", function() {
                  expect($(".wedit-preview").html()).toBe('<hr>\n\n<p>not selected</p>');
               });
            });
         });

         describe("when multiple lines of text are selected", function() {
            beforeEach(function() {
               $("#it").val("One\nTwo\nThree\nFour");
               spyOn(jQuery.fn, "caret").and.returnValue({start: 0, end: 18, text: "One\nTwo\nThree\nFour"});
            });

            describe("Quotes button", function() {
               beforeEach(function() {
                  $(".wedit-quotes").click();
               });

               it("will handle multiple lines", function() {
                  expect($("#it").val()).toBe("> One\n> Two\n> Three\n> Four");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<blockquote>\n  <p>One\n  Two\n  Three\n  Four</p>\n</blockquote>")
               });
            });

            describe("Ordered List button", function() {
               beforeEach(function() {
                  $(".wedit-olist").click();
               });

               it("will handle multiple lines", function() {
                  expect($("#it").val()).toBe(" 1. One\n 2. Two\n 3. Three\n 4. Four");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<ol>\n<li>One</li>\n<li>Two</li>\n<li>Three</li>\n<li>Four</li>\n</ol>")
               });
            });

            describe("Unordered List button", function() {
               beforeEach(function() {
                  $(".wedit-list").click();
               });

               it("will handle multiple lines", function() {
                  expect($("#it").val()).toBe(" - One\n - Two\n - Three\n - Four");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<ul>\n<li>One</li>\n<li>Two</li>\n<li>Three</li>\n<li>Four</li>\n</ul>")
               });
            });
         });

         describe("when enter is pressed", function() {
            var keypress = $.Event('keyup');
            keypress.keyCode = 13;

            describe("auotindent blockquotes", function() {
               beforeEach(function() {
                  $("#it").val("> Blockquote\n");
                  $('#it').trigger(keypress);
               });

               it("should add second line of default blockquote text", function() {
                  expect($("#it").val()).toBe("> Blockquote\n> Blockquote");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<blockquote>\n  <p>Blockquote\n  Blockquote</p>\n</blockquote>")
               });
            });

            describe("autoindent ordered lists", function() {
               beforeEach(function() {
                  $("#it").val(" 1. List item\n");
                  $("#it").trigger(keypress);
               });

               it("it should add a second ordered list item", function() {
                  expect($("#it").val()).toBe(" 1. List item\n 2. List item");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<ol>\n<li>List item</li>\n<li>List item</li>\n</ol>")
               });
            });

            describe("autoindent unordered lists", function() {
               beforeEach(function() {
                  $("#it").val(" - List item\n");
                  $("#it").trigger(keypress);
               });

               it("it should add a second ordered list item", function() {
                  expect($("#it").val()).toBe(" - List item\n - List item");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<ul>\n<li>List item</li>\n<li>List item</li>\n</ul>")
               });
            });

            describe("escaping blockquote autoindent", function() {
               beforeEach(function() {
                  $("#it").val("> Blockquote\n> \n")
                  spyOn(jQuery.fn, "caret").and.returnValue({start: 16, end: 16, text: ""});
                  $("#it").trigger(keypress);
               });

               it("should not continue the autoindent pattern and remove any superfluous blockquote tags", function() {
                  expect($("#it").val()).toBe("> Blockquote\n\n");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<blockquote>\n  <p>Blockquote</p>\n</blockquote>")
               });
            });

            describe("escaping ordered list autoindent", function() {
               beforeEach(function() {
                  $("#it").val(" 1. List item\n 2. \n")
                  spyOn(jQuery.fn, "caret").and.returnValue({start: 19, end: 19, text: ""});
                  $("#it").trigger(keypress);
               });

               it("should not continue the autoindent pattern and remove any superfluous list tags", function() {
                  expect($("#it").val()).toBe(" 1. List item\n\n");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<ol>\n<li>List item</li>\n</ol>")
               });
            });

            describe("escaping unordered list autoindent", function() {
               beforeEach(function() {
                  $("#it").val(" - List item\n - \n")
                  spyOn(jQuery.fn, "caret").and.returnValue({start: 17, end: 17, text: ""});
                  $("#it").trigger(keypress);
               });

               it("should not continue the autoindent pattern and remove any superfluous list tags", function() {
                  expect($("#it").val()).toBe(" - List item\n\n");
               });

               it("should update the preivew div", function() {
                  expect($(".wedit-preview").html()).toBe("<ul>\n<li>List item</li>\n</ul>")
               });
            });
         });

         describe("shortcut keypress events", function() {
            var keypress = $.Event('keydown');
            keypress.metaKey = true;

            describe("bold shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "bold");
                  keypress.keyCode = 66;
                  $("#it").trigger(keypress);
               });

               it("should call the bold action", function() {
                  expect(Weditor.Actions.bold).toHaveBeenCalled();
               });
            });

            describe("italic shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "italic");
                  keypress.keyCode = 73;
                  $("#it").trigger(keypress);
               });

               it("should call the italic action", function() {
                  expect(Weditor.Actions.italic).toHaveBeenCalled();
               });
            });

            describe("link shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "link");
                  keypress.keyCode = 76;
                  $("#it").trigger(keypress);
               });

               it("should call the link action", function() {
                  expect(Weditor.Actions.link).toHaveBeenCalled();
               });
            });

            describe("blockquotes shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "quotes");
                  keypress.keyCode = 81;
                  $("#it").trigger(keypress);
               });

               it("should call the quotes action", function() {
                  expect(Weditor.Actions.quotes).toHaveBeenCalled();
               });
            });

            describe("ordered list shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "olist");
                  keypress.keyCode = 79;
                  $("#it").trigger(keypress);
               });

               it("should call the ordered list action", function() {
                  expect(Weditor.Actions.olist).toHaveBeenCalled();
               });
            });

            describe("unordered list shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "list");
                  keypress.keyCode = 85;
                  $("#it").trigger(keypress);
               });

               it("should call the unordered list action", function() {
                  expect(Weditor.Actions.list).toHaveBeenCalled();
               });
            });

            describe("unordered list shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "list");
                  keypress.keyCode = 85;
                  $("#it").trigger(keypress);
               });

               it("should call the unordered list action", function() {
                  expect(Weditor.Actions.list).toHaveBeenCalled();
               });
            });

            describe("heading shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "heading");
                  keypress.keyCode = 72;
                  $("#it").trigger(keypress);
               });

               it("should call the heading action", function() {
                  expect(Weditor.Actions.heading).toHaveBeenCalled();
               });
            });

            describe("pagebreak shortcut", function() {
               beforeEach(function() {
                  spyOn(Weditor.Actions, "pagebreak");
                  keypress.keyCode = 82;
                  $("#it").trigger(keypress);
               });

               it("should call the pagebreak action", function() {
                  expect(Weditor.Actions.pagebreak).toHaveBeenCalled();
               });
            });

            describe("redo shortcut", function() {
               beforeEach(function() {
                  spyOn(window, 'alert').and.returnValue(true);
                  spyOn(Weditor.Actions, "redo");
                  keypress.keyCode = 89;
                  $("#it").trigger(keypress);
               });

               it("should call the redo action", function() {
                  expect(Weditor.Actions.redo).toHaveBeenCalled();
               });
            });

            describe("undo shortcut", function() {
               beforeEach(function() {
                  spyOn(window, 'alert').and.returnValue(true);
                  spyOn(Weditor.Actions, "undo");
                  keypress.keyCode = 90;
                  $("#it").trigger(keypress);
               });

               it("should call the undo action", function() {
                  expect(Weditor.Actions.undo).toHaveBeenCalled();
               });
            });

            describe("alternate redo shortcut", function() {
               beforeEach(function() {
                  spyOn(window, 'alert').and.returnValue(true);
                  spyOn(Weditor.Actions, "redo");
                  keypress.shiftKey = true;
                  keypress.keyCode = 90;
                  $("#it").trigger(keypress);
               });

               it("should call the undo action", function() {
                  expect(Weditor.Actions.redo).toHaveBeenCalled();
               });
            });
         });
      });
   });
});