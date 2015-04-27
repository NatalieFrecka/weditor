# weditor

## About weditor
Weditor is a fusion of [MDMagick][1] and derobins' branch of [wmd][2]. I wanted to be able to use more than one wmd input per page, which MDMagick supplied, but I wanted to keep all the more advanced features, such as auto-indenting, undo/redo,etc, that MDMagick did not provide. Rather than deconstruct wmd, which is fairly lengthy, I decided to just start with MDMagick and throw pieces of wmd into it. I wed the two of them together. Thus, the name. You will see chunks of both code bases floating around in Weditor, as I tried not to rewrite the portions that worked.

[1]: https://github.com/fguillen/MDMagick
[2]: https://github.com/derobins/wmd

## Dependencies
 - jquery
 - jquery ui
 - [jcaret][3]
 - [jquery broswer plugin][4]
 - [showdownt][5]

[3]: https://github.com/joe-loco/jcaret/blob/master/jquery.caret.js
[4]: https://github.com/gabceb/jquery-browser-plugin
[5]: https://github.com/showdownjs/showdown

## How to use it

Just like MDMagick you have two choices:

**NOTE: Both methods require a parent div around your input/textarea with the class 'weditor'.**

You can call the 'weditThis' function on your input or textarea:
	
	<div class="weditor">
		<textarea id="input-1"></textarea>
	</div>
	<script>
    	$("#input-1").weditThis();
	</script>

Or you can initialize it on page load by giving your input or textarea the class 'wedit-input'.
	
	<div class="weditor">
    	<textarea class="wedit-input"></textarea>
    </div>

## Goals
 1. More robust testing around undo/redo.
 2. Remove dependency on jquery browser plugin.
 3. Remove dependency on jcaret (would solve #2).
 4. Make it better. Always make it better.
