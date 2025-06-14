#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create a simple Disney castle SVG icon
const createCastleIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="castleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E5BBA;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#E74C3C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C0392B;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="50" cy="50" r="48" fill="#F8F9FA" stroke="#E9ECEF" stroke-width="2"/>
  
  <!-- Castle base -->
  <rect x="25" y="60" width="50" height="30" fill="url(#castleGradient)" rx="2"/>
  
  <!-- Castle towers -->
  <rect x="20" y="45" width="12" height="45" fill="url(#castleGradient)" rx="1"/>
  <rect x="68" y="45" width="12" height="45" fill="url(#castleGradient)" rx="1"/>
  <rect x="44" y="35" width="12" height="55" fill="url(#castleGradient)" rx="1"/>
  
  <!-- Tower roofs -->
  <polygon points="26,45 20,30 32,30" fill="url(#roofGradient)"/>
  <polygon points="74,45 68,30 80,30" fill="url(#roofGradient)"/>
  <polygon points="50,35 44,20 56,20" fill="url(#roofGradient)"/>
  
  <!-- Castle gate -->
  <rect x="45" y="70" width="10" height="15" fill="#34495E" rx="5"/>
  
  <!-- Windows -->
  <rect x="22" y="50" width="3" height="4" fill="#F39C12" rx="1"/>
  <rect x="27" y="50" width="3" height="4" fill="#F39C12" rx="1"/>
  <rect x="70" y="50" width="3" height="4" fill="#F39C12" rx="1"/>
  <rect x="75" y="50" width="3" height="4" fill="#F39C12" rx="1"/>
  <rect x="46" y="40" width="3" height="4" fill="#F39C12" rx="1"/>
  <rect x="51" y="40" width="3" height="4" fill="#F39C12" rx="1"/>
  
  <!-- Stars -->
  <polygon points="50,15 51,12 54,12 51.5,10 52.5,7 50,8.5 47.5,7 48.5,10 46,12 49,12" fill="#F1C40F"/>
  <polygon points="15,25 16,23 18,23 16.5,21.5 17,19 15,20 13,19 13.5,21.5 12,23 14,23" fill="#F1C40F"/>
  <polygon points="85,35 86,33 88,33 86.5,31.5 87,29 85,30 83,29 83.5,31.5 82,33 84,33" fill="#F1C40F"/>
</svg>`;
};

// Create a simple PNG data URL from SVG
const svgToPngDataUrl = (svgString, size) => {
  // For a real implementation, you'd use a library like sharp or canvas
  // For now, we'll create a simple colored square as a fallback
  const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#4A90E2"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#FFFFFF"/>
    <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" fill="#4A90E2" font-family="Arial" font-size="${size/8}" font-weight="bold">D</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
};

// Icon sizes needed
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating icon files...');

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = createCastleIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Created ${filename}`);
});

// Create a favicon.ico equivalent as SVG
const faviconSvg = createCastleIcon(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSvg);
console.log('✅ Created favicon.svg');

// Create a simple favicon.ico fallback
const faviconIco = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#4A90E2"/>
  <circle cx="16" cy="16" r="10" fill="#FFFFFF"/>
  <text x="16" y="20" text-anchor="middle" fill="#4A90E2" font-family="Arial" font-size="12" font-weight="bold">D</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), faviconIco);
console.log('✅ Created favicon.ico');

console.log('\n🎉 All icon files generated successfully!');
console.log('\nNote: For production, consider using a proper image conversion tool like Sharp to create actual PNG files.');
console.log('The current implementation creates SVG files which work well for most browsers.'); 