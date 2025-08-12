# NewTabPage v4.0

This project is a Chromium extension template for a customizable new tab page. It provides a basic scaffold with no business logic, serving as a starting point for further development.

## Project Structure

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
        └── widgets.js
```

## Getting Started

1. **Clone or download** this repository.
2. **Load as unpacked extension** in your Chromium-based browser:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `main` directory.

## Notes

- This is a boilerplate template; no business logic is included.
- All assets and HTML/CSS/JS files are ready for customization.
- See `.github/copilot-instructions.md` for project scaffolding details.

## License

This project is provided as a template. Add your license information here.
