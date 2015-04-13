/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
		'mdm-icon-undo': '&#xe965;',
		'mdm-icon-redo': '&#xe966;',
		'mdm-icon-quotes-left': '&#xe977;',
		'mdm-icon-list-numbered': '&#xe9b9;',
		'mdm-icon-list2': '&#xe9bb;',
		'mdm-icon-link': '&#xe9cb;',
		'mdm-icon-font-size': '&#xea61;',
		'mdm-icon-bold': '&#xea62;',
		'mdm-icon-italic': '&#xea64;',
		'mdm-icon-pagebreak': '&#xea6e;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/mdm-icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
