const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'C:/Users/evgenii/Downloads/gmail12_extracted';
const outputDir = 'C:/Users/evgenii/Downloads/gmail12_watermarked';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// SVG watermark overlay
function makeWatermarkSvg(width, height) {
  const fontSize = Math.round(Math.min(width, height) * 0.045);
  const logoSize = Math.round(fontSize * 1.2);
  return Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .wm { font-family: 'Arial', sans-serif; font-weight: 700; letter-spacing: 0.05em; }
  </style>
  <!-- Bottom-right watermark -->
  <text x="${width - 20}" y="${height - 16}" text-anchor="end"
    class="wm" font-size="${fontSize}"
    fill="white" opacity="0.55"
    stroke="rgba(0,0,0,0.3)" stroke-width="3" paint-order="stroke">
    99 properties
  </text>
</svg>`);
}

async function processImage(file) {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  const img = sharp(inputPath);
  const meta = await img.metadata();
  const w = meta.width;
  const h = meta.height;

  const watermark = makeWatermarkSvg(w, h);

  await img
    .composite([{ input: watermark, top: 0, left: 0 }])
    .jpeg({ quality: 82 })
    .toFile(outputPath);

  const stat = fs.statSync(outputPath);
  console.log(`✓ ${file} → ${w}×${h} → ${(stat.size/1024).toFixed(0)}KB`);
  return outputPath;
}

// Process photos 549-559 (not 560 which is the example screenshot)
const files = fs.readdirSync(inputDir)
  .filter(f => f.endsWith('.jpg') && f !== '1000055560.jpg')
  .sort();

console.log(`Processing ${files.length} photos...`);
Promise.all(files.map(processImage)).then(() => {
  console.log('Done! All watermarked.');
});
