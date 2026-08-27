const fs = require('fs');
const img = fs.readFileSync('./src/app/icon.jpg');
const base64 = img.toString('base64');
const svg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="circleClip">
      <circle cx="512" cy="512" r="512" />
    </clipPath>
  </defs>
  <image href="data:image/jpeg;base64,${base64}" width="1024" height="1024" clip-path="url(#circleClip)" />
</svg>`;
fs.writeFileSync('./src/app/icon.svg', svg);
