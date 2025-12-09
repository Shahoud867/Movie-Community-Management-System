const fs = require('fs');
const path = require('path');

// Create favicon directory
const faviconDir = path.join(__dirname, '../dist');

// SVG favicon with MC logo (Movie Community)
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#1d4ed8" rx="6"/>
  <text x="16" y="23" font-size="18" font-family="Arial, sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">MC</text>
</svg>`;

// Write favicon
fs.writeFileSync(path.join(faviconDir, 'favicon.svg'), faviconSvg);

console.log('✓ Created favicon.svg');
console.log('✓ Favicon saved to:', faviconDir);
