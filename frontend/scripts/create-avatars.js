const fs = require('fs');
const path = require('path');

// Create avatars directory
const avatarsDir = path.join(__dirname, '../dist/images/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// SVG for male avatar (blue)
const maleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#3b82f6"/>
  <circle cx="200" cy="140" r="60" fill="#ffffff"/>
  <path d="M 120 320 Q 120 240 200 240 Q 280 240 280 320 L 280 400 L 120 400 Z" fill="#ffffff"/>
  <text x="200" y="420" font-size="24" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">Male User</text>
</svg>`;

// SVG for female avatar (pink)
const femaleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#ec4899"/>
  <circle cx="200" cy="140" r="60" fill="#ffffff"/>
  <path d="M 120 320 Q 120 240 200 240 Q 280 240 280 320 L 280 400 L 120 400 Z" fill="#ffffff"/>
  <text x="200" y="420" font-size="24" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">Female User</text>
</svg>`;

// Write SVG files
fs.writeFileSync(path.join(avatarsDir, 'male-avatar.svg'), maleSvg);
fs.writeFileSync(path.join(avatarsDir, 'female-avatar.svg'), femaleSvg);

console.log('✓ Created male-avatar.svg');
console.log('✓ Created female-avatar.svg');
console.log('✓ Avatars saved to:', avatarsDir);
