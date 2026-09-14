const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Generate 3D Green Dollar Sign matching user's uploaded image
function getDollarSignSvg(isMaskable = false) {
  // If maskable, scale to 80% with safe zone
  const scale = isMaskable ? 0.75 : 0.88;
  const translate = isMaskable ? 64 : 30;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#EDF2F7" />
    </linearGradient>

    <!-- Floor Shadow / Reflection Gradient -->
    <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.22" />
      <stop offset="40%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="reflectionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#16A34A" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#15803D" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>

    <!-- Front Face Green Gradient (Vibrant Glossy Green) -->
    <linearGradient id="greenFront" x1="0%" y1="0%" x2="30%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="15%" stop-color="#22C55E" />
      <stop offset="70%" stop-color="#16A34A" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>

    <!-- 3D Extrusion Side Gradient (Depth / Shading) -->
    <linearGradient id="greenSideDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15803D" />
      <stop offset="50%" stop-color="#166534" />
      <stop offset="100%" stop-color="#14532D" />
    </linearGradient>

    <linearGradient id="greenSideLight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22C55E" />
      <stop offset="60%" stop-color="#16A34A" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>

    <!-- Specular Highlight for glossy beveled look -->
    <linearGradient id="specularGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6" />
      <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>

    <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>

  <!-- Clean Background -->
  <rect width="512" height="512" rx="${isMaskable ? 0 : 96}" fill="url(#bgGrad)" />

  <g transform="translate(${translate}, ${translate}) scale(${scale})">
    <!-- Ground Shadow Beneath 3D Dollar -->
    <ellipse cx="256" cy="452" rx="140" ry="18" fill="url(#floorShadow)" />
    <ellipse cx="256" cy="452" rx="100" ry="10" fill="#000000" opacity="0.16" filter="url(#softBlur)" />

    <!-- Subtle Floor Reflection -->
    <g transform="translate(0, 452) scale(1, -0.22)" opacity="0.4" filter="url(#softBlur)">
      <text x="256" y="380" 
        font-family="'Arial Black', 'Impact', 'Montserrat', sans-serif" 
        font-weight="900" 
        font-size="410" 
        fill="url(#reflectionGrad)" 
        text-anchor="middle">$</text>
    </g>

    <!-- 3D Extrusion Layers (creating thick depth angled toward top-right) -->
    <!-- Extruded shadow edges (layered offsets) -->
    ${[36, 33, 30, 27, 24, 21, 18, 15, 12, 9, 6, 3].map((offset, i) => `
      <text x="${256 - offset * 0.4}" y="${380 + offset * 0.2}" 
        font-family="'Arial Black', 'Impact', 'Montserrat', sans-serif" 
        font-weight="900" 
        font-size="410" 
        fill="${i < 4 ? '#0F3E1E' : '#14532D'}" 
        stroke="${i < 4 ? '#0D3318' : '#166534'}" 
        stroke-width="14"
        stroke-linejoin="round"
        text-anchor="middle">$</text>
    `).join('')}

    <!-- Mid bevel / Lateral light reflection -->
    <text x="252" y="382" 
      font-family="'Arial Black', 'Impact', 'Montserrat', sans-serif" 
      font-weight="900" 
      font-size="410" 
      fill="url(#greenSideLight)" 
      stroke="#15803D" 
      stroke-width="10"
      stroke-linejoin="round"
      text-anchor="middle">$</text>

    <!-- Main Front Face (Glossy Green) -->
    <text x="256" y="380" 
      font-family="'Arial Black', 'Impact', 'Montserrat', sans-serif" 
      font-weight="900" 
      font-size="410" 
      fill="url(#greenFront)" 
      stroke="#4ADE80" 
      stroke-width="3"
      stroke-linejoin="round"
      text-anchor="middle">$</text>

    <!-- Glossy Highlight Overlay -->
    <text x="256" y="380" 
      font-family="'Arial Black', 'Impact', 'Montserrat', sans-serif" 
      font-weight="900" 
      font-size="410" 
      fill="url(#specularGlow)" 
      text-anchor="middle">$</text>

    <!-- Inner Core Crisp Stroke for 3D realism -->
    <text x="256" y="380" 
      font-family="'Arial Black', 'Impact', 'Montserrat', sans-serif" 
      font-weight="900" 
      font-size="410" 
      fill="none" 
      stroke="#86EFAC" 
      stroke-width="1.5"
      stroke-dasharray="8 6"
      opacity="0.7"
      text-anchor="middle">$</text>
  </g>
</svg>`;
}

async function generateIcons() {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const distDir = path.resolve(__dirname, '..', 'dist');

  const standardSvg = getDollarSignSvg(false);
  const maskableSvg = getDollarSignSvg(true);

  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);

  // Generate 192x192 PNG
  const pwa192Buffer = await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192Buffer);

  // Generate 512x512 PNG
  const pwa512Buffer = await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512Buffer);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), pwa512Buffer);

  // Generate 512x512 Maskable PNG
  const pwaMaskableBuffer = await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskableBuffer);

  // Generate 180x180 Apple Touch Icon
  const appleTouchBuffer = await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchBuffer);

  // Also copy to dist if dist exists
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'pwa-192x192.png'), pwa192Buffer);
    fs.writeFileSync(path.join(distDir, 'pwa-512x512.png'), pwa512Buffer);
    fs.writeFileSync(path.join(distDir, 'pwa-maskable-512x512.png'), pwaMaskableBuffer);
    fs.writeFileSync(path.join(distDir, 'apple-touch-icon.png'), appleTouchBuffer);
    fs.writeFileSync(path.join(distDir, 'icon.png'), pwa512Buffer);
    fs.writeFileSync(path.join(distDir, 'icon.svg'), standardSvg);
  }

  console.log('Successfully generated all PWA icons (192x192, 512x512, maskable, apple-touch-icon)!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
