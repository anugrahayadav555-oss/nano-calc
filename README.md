# Nano Calc

Nano Calc is a minimal, fast, installable mobile calculator PWA. It supports essential mathematical operations, an automatic reset-based history system, and an Apple-style responsive UI.

## Features
- **Core Arithmetic**: Addition, subtraction, multiplication, division.
- **Advanced Operations**: Square root, percentage, fraction inversion (1/x).
- **History System**: Saves your last 10 calculations. When the 11th is performed, the history list automatically resets.
- **Progressive Web App**: Installable locally and works entirely offline.
- **Keyboard Support**: Fully navigable via physical keyboards (NumPad, Enter, Esc, Backspace, Ops).
- **Responsive Theme**: Premium dark theme Apple-style layout mimicking native mobile experiences, scaling comfortably to desktop and tablet in landscape modes.

## How to use
1. Host the folder on any local server (e.g., `python -m http.server 8000` or `npx serve`).
2. Open `index.html` in your web browser.
3. To install, click the settings/PWA install icon in your browser's address bar.

## Technology Stack
- HTML5
- Vanilla CSS3
- Vanilla JavaScript
- PWA Service Worker + Manifest

Built according to the Nano Calc PRD specs.
