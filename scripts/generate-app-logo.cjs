const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function getAppLogoSvg(isMaskable = false) {
  // Safe zone for maskable icon: keep essential elements within 80% circle (scale 0.76, translate 60)
  const scale = isMaskable ? 0.76 : 0.90;
  const translate = isMaskable ? 61 : 25;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Studio Grey Background Gradient -->
    <radialGradient id="studioBg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#9CA3AF" />
      <stop offset="60%" stop-color="#8B95A5" />
      <stop offset="100%" stop-color="#7B8595" />
    </radialGradient>

    <!-- Ground Floor Shadow Filter -->
    <filter id="groundShadowFilter" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="12" />
      <feOffset dx="0" dy="16" />
      <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Bar Drop Shadow for 3D Arrow -->
    <filter id="arrowShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="8" stdDeviation="5" flood-color="#000000" flood-opacity="0.38" />
    </filter>

    <!-- Dollar Sign Drop Shadow -->
    <filter id="dollarShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.35" />
    </filter>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" />
    </filter>

    <!-- Green Bar Front Face Gradient -->
    <linearGradient id="barFront" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="25%" stop-color="#059669" />
      <stop offset="75%" stop-color="#047857" />
      <stop offset="100%" stop-color="#065F46" />
    </linearGradient>

    <!-- Green Bar Top Face Gradient -->
    <linearGradient id="barTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EE7B7" />
      <stop offset="50%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>

    <!-- Green Bar Right Side (3D depth) Gradient -->
    <linearGradient id="barSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#047857" />
      <stop offset="50%" stop-color="#064E3B" />
      <stop offset="100%" stop-color="#022C22" />
    </linearGradient>

    <!-- Bar Highlight (Specular edge) -->
    <linearGradient id="specularBar" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#A7F3D0" stop-opacity="0.8" />
      <stop offset="20%" stop-color="#34D399" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#059669" stop-opacity="0" />
    </linearGradient>

    <!-- Silver Arrow Face Gradient (Glossy metallic chrome) -->
    <linearGradient id="chromeFace" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#F1F5F9" />
      <stop offset="50%" stop-color="#CBD5E1" />
      <stop offset="75%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>

    <!-- Silver Arrow Bevel / Side Gradient -->
    <linearGradient id="chromeSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8" />
      <stop offset="40%" stop-color="#64748B" />
      <stop offset="80%" stop-color="#475569" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>

    <!-- Silver Arrow Specular Glint -->
    <linearGradient id="chromeGlint" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.8" />
    </linearGradient>

    <!-- 3D Dollar Sign Gradient -->
    <linearGradient id="dollarFront" x1="0%" y1="0%" x2="40%" y2="100%">
      <stop offset="0%" stop-color="#6EE7B7" />
      <stop offset="20%" stop-color="#10B981" />
      <stop offset="65%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <linearGradient id="dollarSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>

    <linearGradient id="dollarGlint" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.75" />
      <stop offset="35%" stop-color="#A7F3D0" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Background: Studio Neutral Gray with Rounded Corners if not maskable -->
  <rect width="512" height="512" rx="${isMaskable ? 0 : 100}" fill="url(#studioBg)" />

  <g transform="translate(${translate}, ${translate}) scale(${scale})">
    <!-- Ground Ambient Shadow Beneath All Bars -->
    <ellipse cx="265" cy="442" rx="175" ry="18" fill="#1E293B" opacity="0.32" filter="url(#groundShadowFilter)" />
    <ellipse cx="265" cy="440" rx="145" ry="12" fill="#0F172A" opacity="0.28" filter="url(#softGlow)" />

    <!-- 5 VERTICAL 3D GREEN BARS (Ascending left-to-right) -->
    <!--
      Perspective parameters:
      Bar Width: 46px
      Gap: 14px
      3D Depth Offset: dx = 12, dy = -10
      Base Y: 415
      Bar 1: x=102, y=325, h=90 (top cap at y=325)
      Bar 2: x=162, y=275, h=140
      Bar 3: x=222, y=225, h=190
      Bar 4: x=282, y=175, h=240
      Bar 5: x=342, y=125, h=290
    -->

    <!-- BAR 1 (x=102, h=90) -->
    <g id="bar1">
      <!-- 3D Right Side -->
      <path d="M 148 335 L 160 325 L 160 405 L 148 415 Z" fill="url(#barSide)" />
      <!-- 3D Top Cap -->
      <path d="M 102 335 Q 125 325 148 335 L 160 325 Q 137 315 114 325 Z" fill="url(#barTop)" />
      <!-- Front Face -->
      <rect x="102" y="335" width="46" height="80" rx="8" fill="url(#barFront)" />
      <!-- Front Highlight -->
      <rect x="104" y="337" width="6" height="74" rx="3" fill="url(#specularBar)" opacity="0.75" />
    </g>

    <!-- BAR 2 (x=162, h=140) -->
    <g id="bar2">
      <!-- 3D Right Side -->
      <path d="M 208 285 L 220 275 L 220 405 L 208 415 Z" fill="url(#barSide)" />
      <!-- 3D Top Cap -->
      <path d="M 162 285 Q 185 275 208 285 L 220 275 Q 197 265 174 275 Z" fill="url(#barTop)" />
      <!-- Front Face -->
      <rect x="162" y="285" width="46" height="130" rx="8" fill="url(#barFront)" />
      <!-- Front Highlight -->
      <rect x="164" y="287" width="6" height="124" rx="3" fill="url(#specularBar)" opacity="0.75" />
    </g>

    <!-- BAR 3 (x=222, h=190) -->
    <g id="bar3">
      <!-- 3D Right Side -->
      <path d="M 268 235 L 280 225 L 280 405 L 268 415 Z" fill="url(#barSide)" />
      <!-- 3D Top Cap -->
      <path d="M 222 235 Q 245 225 268 235 L 280 225 Q 257 215 234 225 Z" fill="url(#barTop)" />
      <!-- Front Face -->
      <rect x="222" y="235" width="46" height="180" rx="8" fill="url(#barFront)" />
      <!-- Front Highlight -->
      <rect x="224" y="237" width="6" height="174" rx="3" fill="url(#specularBar)" opacity="0.75" />
    </g>

    <!-- BAR 4 (x=282, h=240) -->
    <g id="bar4">
      <!-- 3D Right Side -->
      <path d="M 328 185 L 340 175 L 340 405 L 328 415 Z" fill="url(#barSide)" />
      <!-- 3D Top Cap -->
      <path d="M 282 185 Q 305 175 328 185 L 340 175 Q 317 165 294 175 Z" fill="url(#barTop)" />
      <!-- Front Face -->
      <rect x="282" y="185" width="46" height="230" rx="8" fill="url(#barFront)" />
      <!-- Front Highlight -->
      <rect x="284" y="187" width="6" height="224" rx="3" fill="url(#specularBar)" opacity="0.75" />
    </g>

    <!-- BAR 5 (x=342, h=290) -->
    <g id="bar5">
      <!-- 3D Right Side -->
      <path d="M 388 135 L 400 125 L 400 405 L 388 415 Z" fill="url(#barSide)" />
      <!-- 3D Top Cap -->
      <path d="M 342 135 Q 365 125 388 135 L 400 125 Q 377 115 354 125 Z" fill="url(#barTop)" />
      <!-- Front Face -->
      <rect x="342" y="135" width="46" height="280" rx="8" fill="url(#barFront)" />
      <!-- Front Highlight -->
      <rect x="344" y="137" width="6" height="274" rx="3" fill="url(#specularBar)" opacity="0.75" />
    </g>

    <!-- FLOATING 3D DOLLAR SIGN ($) Above Bars 3 & 4 -->
    <!-- Center approx x=252, y=105 -->
    <g id="dollarSign" filter="url(#dollarShadow)">
      <!-- 3D Extrusion Side Layers -->
      ${[12, 10, 8, 6, 4, 2].map((offset, i) => `
        <text x="${252 + offset * 0.7}" y="${120 - offset * 0.3}"
          font-family="'Arial Black', 'Impact', sans-serif"
          font-weight="900"
          font-size="94"
          fill="${i < 3 ? '#044422' : '#065F46'}"
          stroke="#022C22"
          stroke-width="5"
          text-anchor="middle">$</text>
      `).join('')}

      <!-- Dollar Front Face -->
      <text x="252" y="120"
        font-family="'Arial Black', 'Impact', sans-serif"
        font-weight="900"
        font-size="94"
        fill="url(#dollarFront)"
        stroke="#10B981"
        stroke-width="2.5"
        stroke-linejoin="round"
        text-anchor="middle">$</text>

      <!-- Dollar Glossy Highlight -->
      <text x="252" y="120"
        font-family="'Arial Black', 'Impact', sans-serif"
        font-weight="900"
        font-size="94"
        fill="url(#dollarGlint)"
        text-anchor="middle">$</text>
    </g>

    <!-- 3D METALLIC CHROME/SILVER ZIGZAG ARROW -->
    <!--
      Path nodes:
      Start: (110, 395)
      Peak 1: (180, 340)
      Valley 1: (230, 385)
      Peak 2: (290, 310)
      Valley 2: (335, 360)
      Arrow Tip: (408, 175)
      Arrow Head base: (375, 230), (415, 215)
    -->
    <g id="silverArrow" filter="url(#arrowShadow)">
      <!-- 3D Dark Beveled Extrusion (Back / Underside) -->
      <path d="
        M 108 406 
        L 178 351 
        L 228 396 
        L 288 321 
        L 333 371 
        L 358 266 
        L 340 268 
        L 410 183 
        L 426 258 
        L 408 256 
        L 392 321 
        L 347 271 
        L 287 346 
        L 237 301 
        L 187 341 
        L 117 396 
        Z
      " fill="url(#chromeSide)" opacity="0.95" />

      <!-- Chrome Arrow Body / Shaft (Front Face) -->
      <!-- Shaft path: ribbon with thickness ~20px -->
      <path d="
        M 104 395
        L 174 340
        L 224 385
        L 284 310
        L 329 360
        L 368 250
        L 348 254
        L 406 172
        L 422 246
        L 402 244
        L 374 325
        L 339 375
        L 284 325
        L 224 400
        L 174 355
        L 104 410
        Z
      " fill="url(#chromeFace)" stroke="#CBD5E1" stroke-width="1.5" stroke-linejoin="round" />

      <!-- Specular White Glint Along Top Ridge -->
      <path d="
        M 106 397
        L 174 342
        L 224 387
        L 284 312
        L 329 362
        L 366 254
        L 404 176
      " fill="none" stroke="url(#chromeGlint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Secondary Lower Glint for 3D Tubular Look -->
      <path d="
        M 106 408
        L 174 353
        L 224 398
        L 284 323
        L 338 373
      " fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" stroke-linecap="round" />

      <!-- Arrowhead Crisp Bevel Line -->
      <line x1="406" y1="172" x2="385" y2="248" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.9" />
    </g>
  </g>
</svg>`;
}

async function generateAllAppIcons() {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const distDir = path.resolve(__dirname, '..', 'dist');

  const standardSvg = getAppLogoSvg(false);
  const maskableSvg = getAppLogoSvg(true);

  // 1. Write SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);

  // 2. Generate 192x192 PNG (Standard Android / PWA)
  const pwa192Buffer = await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192Buffer);

  // 3. Generate 512x512 PNG (Standard Android / PWA / APK main icon)
  const pwa512Buffer = await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512Buffer);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), pwa512Buffer);

  // 4. Generate 512x512 Maskable PNG (Android Adaptive Icon safe-zone)
  const pwaMaskableBuffer = await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskableBuffer);

  // 5. Generate 180x180 Apple Touch Icon (iOS Safari Home Screen)
  const appleTouchBuffer = await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchBuffer);

  // Also sync to dist if dist exists
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'pwa-192x192.png'), pwa192Buffer);
    fs.writeFileSync(path.join(distDir, 'pwa-512x512.png'), pwa512Buffer);
    fs.writeFileSync(path.join(distDir, 'pwa-maskable-512x512.png'), pwaMaskableBuffer);
    fs.writeFileSync(path.join(distDir, 'apple-touch-icon.png'), appleTouchBuffer);
    fs.writeFileSync(path.join(distDir, 'icon.png'), pwa512Buffer);
    fs.writeFileSync(path.join(distDir, 'icon.svg'), standardSvg);
  }

  console.log('Successfully generated all PWA & Mobile APK icons from user logo!');
}

generateAllAppIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
