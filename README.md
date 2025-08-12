# NewTabPage v4.0

This project is a Chromium extension template for a customizable new tab page. It provides a basic scaffold with no business logic, serving as a starting point for further development.

## Extension Structure

```
main/
├── manifest.json
├── assets/
│   ├── icon.png
│   ├── iconx128.png
│   ├── iconx16.png
│   ├── iconx19.png
│   ├── iconx38.png
│   ├── iconx48.png
│   ├── settings.svg
│   └── lang/
│       # Future users' local language settings
└── pages/
    ├── ntp/
    │   ├── loadWidgets.js
    │   ├── ntp.css
    │   ├── ntp.html
    │   └── onLoad.js
    ├── ntp-editor/
    │   ├── editor.css
    │   ├── editor.html
    │   └── onLoad.js
    ├── options/
    │   ├── onLoad.js
    │   ├── options.css
    │   └── options.html
    └── widgets/
        ├── widgets.js
        │   # Contains links to where each widget is and a preview
        └── loadWidgets.js
            # Contains code to load each widget type
```

