const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir  = 'C:/Users/evgenii/Downloads/gmail12_watermarked';
const outputDir = 'C:/Users/evgenii/Downloads/gmail12_resized';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function resize(file) {
  const inputPath  = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  await sharp(inputPath)
    .resize({ width: 1200, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 68, mozjpeg: true })
    .toFile(outputPath);

  const before = fs.statSync(inputPath).size;
  const after  = fs.statSync(outputPath).size;
  console.log(`${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB`);
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpg')).sort();
Promise.all(files.map(resize)).then(() => console.log('Done!'));
