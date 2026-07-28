const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir  = 'C:/Users/evgenii/Downloads/gmail12_extracted';
const outputDir = 'C:/Users/evgenii/Downloads/gmail12_final';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function makeWatermarkSvg(width, height) {
  const fontSize = Math.round(Math.min(width, height) * 0.042);
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${width - 16}" y="${height - 14}" text-anchor="end"
    font-family="Arial, sans-serif" font-weight="700" font-size="${fontSize}"
    letter-spacing="0.05em"
    fill="white" opacity="0.6"
    stroke="rgba(0,0,0,0.35)" stroke-width="2.5" paint-order="stroke">
    99 properties
  </text>
</svg>`);
}

async function process(file) {
  const src = path.join(inputDir, file);
  const dst = path.join(outputDir, file);

  const img = sharp(src);
  const { width, height } = await img.metadata();

  // Single pass: watermark + quality 85, no resize (originals are already ≤1280px)
  await img
    .composite([{ input: makeWatermarkSvg(width, height), top: 0, left: 0 }])
    .jpeg({ quality: 85, mozjpeg: false })
    .toFile(dst);

  const orig = (fs.statSync(src).size / 1024).toFixed(0);
  const out  = (fs.statSync(dst).size / 1024).toFixed(0);
  console.log(`${file}  ${width}x${height}  ${orig}KB → ${out}KB`);
}

const files = fs.readdirSync(inputDir)
  .filter(f => f.endsWith('.jpg') && f !== '1000055560.jpg')
  .sort();

console.log(`Processing ${files.length} photos from originals (single pass, q85)...`);
Promise.all(files.map(process)).then(() => console.log('Done!'));
