const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Master vector SVG for Fenouhi icon
// Soft rounded tile with Navy #0D2B4D + Soft Sky Blue #7CB6D9 monogram
function createSvg(size, isMaskable = false) {
  const padding = isMaskable ? Math.round(size * 0.18) : Math.round(size * 0.08);
  const innerSize = size - padding * 2;
  const radius = isMaskable ? 0 : Math.round(size * 0.22);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Card -->
    <rect width="${size}" height="${size}" rx="${radius}" fill="#FFFFFF"/>
    
    <!-- Subtle Inner Border -->
    <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${Math.max(0, radius - 1)}" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Centered Brand Monogram -->
    <g transform="translate(${padding}, ${padding}) scale(${innerSize / 100})">
      <!-- 1. Upper Navy Hook -->
      <path
        d="M 22 50 C 22 32 36 18 56 18 L 78 18 C 86.8 18 94 25.2 94 34 C 94 42.8 86.8 50 78 50 L 66 50 C 56 50 48 58 48 68 C 48 70 48.5 72 49 74 C 42 73 35 69 30 64 C 25 59 22 55 22 50 Z"
        fill="#0D2B4D"
      />
      <!-- 2. Lower Soft Sky Blue Pod -->
      <path
        d="M 22 56 C 22 74 36 90 56 90 C 68 90 78 84 84 75 C 72 82 56 80 46 70 C 38 62 30 58 22 56 Z"
        fill="#7CB6D9"
      />
      <!-- 3. Lower Navy Circle Dot -->
      <circle cx="78" cy="74" r="14" fill="#0D2B4D" />
    </g>
  </svg>`;
}

// Favicon SVG (transparent background or rounded tile)
const faviconSvg = `<svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
  <path d="M 22 50 C 22 32 36 18 56 18 L 78 18 C 86.8 18 94 25.2 94 34 C 94 42.8 86.8 50 78 50 L 66 50 C 56 50 48 58 48 68 C 48 70 48.5 72 49 74 C 42 73 35 69 30 64 C 25 59 22 55 22 50 Z" fill="#0D2B4D"/>
  <path d="M 22 56 C 22 74 36 90 56 90 C 68 90 78 84 84 75 C 72 82 56 80 46 70 C 38 62 30 58 22 56 Z" fill="#7CB6D9"/>
  <circle cx="78" cy="74" r="14" fill="#0D2B4D"/>
</svg>`;

async function generateAll() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'app');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // 1. Write SVG favicons
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), faviconSvg);

  const targets = [
    { file: path.join(iconsDir, 'icon-72x72.png'), size: 72, maskable: false },
    { file: path.join(iconsDir, 'icon-96x96.png'), size: 96, maskable: false },
    { file: path.join(iconsDir, 'icon-192x192.png'), size: 192, maskable: false },
    { file: path.join(iconsDir, 'icon-512x512.png'), size: 512, maskable: false },
    { file: path.join(iconsDir, 'icon-maskable-192x192.png'), size: 192, maskable: true },
    { file: path.join(iconsDir, 'icon-maskable-512x512.png'), size: 512, maskable: true },
    { file: path.join(iconsDir, 'apple-touch-icon.png'), size: 180, maskable: false },
    { file: path.join(publicDir, 'favicon.ico'), size: 48, maskable: false },
    { file: path.join(appDir, 'favicon.ico'), size: 48, maskable: false },
  ];

  for (const t of targets) {
    const svg = createSvg(t.size, t.maskable);
    await sharp(Buffer.from(svg))
      .resize(t.size, t.size)
      .png()
      .toFile(t.file);
    console.log(`Generated: ${t.file} (${t.size}x${t.size})`);
  }

  console.log('All icons generated successfully!');
}

generateAll().catch(console.error);
