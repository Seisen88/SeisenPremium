# 🔥 Prometheus Lua Obfuscator - Web Interface

A beautiful, modern web interface for the Prometheus Lua Obfuscator. This website provides an easy-to-use interface for obfuscating Lua 5.1 and LuaU code.

## ✨ Features

- **Modern UI/UX**: Beautiful dark theme with glassmorphism effects and smooth animations
- **Modular Components**: Reusable header and footer components for easy maintenance
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dual Support**: Supports both Lua 5.1 and LuaU (Roblox) obfuscation
- **Multiple Presets**: Choose from Minify, Weak, Medium, or Strong obfuscation levels
- **File Upload**: Upload .lua files directly or paste code
- **Download & Copy**: Easy export of obfuscated code
- **Keyboard Shortcuts**: Ctrl+Enter to obfuscate, Ctrl+K to clear

## 📁 Project Structure

```
Lua Obfuscator/
├── obfuscator.html              # Main obfuscator page
├── docs.html               # Documentation page
├── about.html              # About page
├── components/
│   ├── header.html         # Reusable header component
│   └── footer.html         # Reusable footer component
├── css/
│   └── style.css           # Comprehensive design system
├── js/
│   ├── components.js       # Component loader
│   ├── obfuscator.js       # Obfuscation logic
│   └── main.js             # Main application logic
└── README.md               # This file
```

## 🚀 Getting Started

### Running Locally

1. Clone or download this repository
2. Open `obfuscator.html` in a modern web browser
3. Start obfuscating your Lua code!

### Using a Local Server (Recommended)

For the best experience, serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🔧 Backend Integration

**Important**: This is currently a frontend demonstration with simulated obfuscation. To enable actual Prometheus obfuscation:

### Option 1: Node.js Backend

1. Install Prometheus:

```bash
git clone https://github.com/wcrddn/Prometheus.git
```

2. Create a Node.js API server that:

   - Accepts POST requests with code, version, and preset
   - Calls Prometheus CLI with the provided parameters
   - Returns the obfuscated code

3. Update `js/obfuscator.js` to call your API endpoint

### Option 2: Python Backend

1. Install Prometheus and create a Flask/FastAPI server
2. Create an endpoint that executes Prometheus
3. Update the frontend to communicate with your backend

### Example API Integration

Replace the `simulateObfuscation` method in `js/obfuscator.js` with:

```javascript
async obfuscate(code, version, preset) {
    const response = await fetch('/api/obfuscate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: code,
            version: version,
            preset: preset
        })
    });

    if (!response.ok) {
        throw new Error('Obfuscation failed');
    }

    const result = await response.json();
    return result.obfuscatedCode;
}
```

## 🎨 Design Features

- **Color Palette**: Modern dark theme with vibrant gradient accents
- **Typography**: Inter font family for clean, professional text
- **Animations**: Smooth transitions, hover effects, and micro-animations
- **Glassmorphism**: Frosted glass effect on cards and panels
- **Responsive Grid**: Adapts to all screen sizes
- **Accessibility**: Semantic HTML and keyboard navigation support

## 📝 Customization

### Modifying Header/Footer

Edit the component files in the `components/` directory:

- `components/header.html` - Navigation and logo
- `components/footer.html` - Footer links and information

Changes will automatically apply to all pages that include these components.

### Styling

All styles are centralized in `css/style.css`:

- CSS variables for easy theme customization
- Organized sections for different components
- Responsive breakpoints for mobile devices

### Adding New Pages

1. Create a new HTML file (e.g., `newpage.html`)
2. Include the header and footer containers:

```html
<div id="header-container"></div>
<!-- Your content here -->
<div id="footer-container"></div>
```

3. Load the component script:

```html
<script src="js/components.js"></script>
```

## 🔗 Resources

- [Prometheus GitHub](https://github.com/wcrddn/Prometheus)
- [Official Documentation](https://levno-710.gitbook.io/prometheus/)
- [Discord Community](https://discord.gg/U8h4d4Rf64)

## 📄 License

This web interface is provided as-is for use with Prometheus.

Prometheus itself is licensed under the GNU Affero General Public License v3.0.
See the [LICENSE](https://github.com/wcrddn/Prometheus/blob/master/LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 💡 Tips

- Use **Ctrl+Enter** to quickly obfuscate code
- Use **Ctrl+K** to clear all fields
- Click notifications to dismiss them
- Hover over controls for helpful tooltips
- Try different presets to find the right balance

---

Made with 🔥 for the Lua community
