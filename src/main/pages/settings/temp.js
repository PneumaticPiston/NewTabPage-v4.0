function unminify(cssString) {
    var defaultTabs = 4, spaces = '';

    if (typeof tabs == 'string') {
        tabs = /^\d+$/.test(tabs) ? parseInt(tabs) : defaultTabs;
    }
    if (typeof tabs == 'undefined') {
        tabs = defaultTabs;
    }
    if (tabs < 0) {
        tabs = defaultTabs;
    }
    cssString = cssString.split('\t').join('    ').replace(/\s*{\s*/g, ' {\n    ').replace(/;\s*/g, ';\n    ').replace(/,\s*/g, ', ').replace(/[ ]*}\s*/g, '}\n').replace(/\}\s*(.+)/g, '}\n$1').replace(/\n    ([^:]+):\s*/g, '\n    $1: ').replace(/([A-z0-9\)])}/g, '$1;\n}');

    if (tabs != 4) {
	    for (;tabs != 0;tabs--) { spaces += ' '; }
	    cssString = cssString.replace(/\n    /g, '\n'+spaces);
    }

    return cssString;
}

function minifyCssString(cssString) {
  let minifiedCss = cssString.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove extra whitespace, tabs, and newlines
  minifiedCss = minifiedCss.replace(/\s+/g, ' ');
  minifiedCss = minifiedCss.replace(/\s*([{}|:;,])\s*/g, '$1');
  minifiedCss = minifiedCss.replace(/;}/g, '}');

  return minifiedCss.trim();
}
