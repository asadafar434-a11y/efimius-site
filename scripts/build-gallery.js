const fs = require('fs');
const path = require('path');

const wDir = 'C:/Users/evgenii/Downloads/gmail12_final';

// Load watermarked photos as base64
const files = fs.readdirSync(wDir).filter(f => f.endsWith('.jpg')).sort();
console.log('Photos to embed:', files.length);

const photos = files.map(f => {
  const buf = fs.readFileSync(path.join(wDir, f));
  return 'data:image/jpeg;base64,' + buf.toString('base64');
});

// Load existing gallery-data.js
let existing = fs.readFileSync('gallery-data.js', 'utf8');
const match = existing.match(/window\.GALLERY\s*=\s*(\[[\s\S]*\])/);
let gallery = (new Function('return ' + match[1]))();

// Add photos array to existing items (backward compat)
gallery = gallery.map(function(p) {
  if (!p.photos) p.photos = [p.src];
  return p;
});

// Remove any previous Lycabettus Studio entry (avoid duplicates on re-run)
gallery = gallery.filter(function(p) {
  return !(p.label === 'Lycabettus Studio' || p.alt === 'Lycabettus Studio');
});

// New Lycabettus studio property
const newProp = {
  id: Date.now(),
  big: false,
  alt: "Lycabettus Studio",
  label: "Lycabettus Studio",
  price: "€800/month",
  location: "Lycabettus, Athens",
  type: "Studio",
  beds: "",
  baths: "1",
  sqm: "40",
  description: "This ground-floor studio in Lycabettus is an excellent choice for short-term rental, whether for holidays, business trips, or a workation. Located in one of the most privileged and quiet areas of central Athens, at the foothills of Lycabettus Hill, it offers easy access to Kolonaki, Syntagma Square, and all major city attractions.\n\nThe location perfectly combines the calm of a residential neighborhood with the vibrancy of the city center. Ideal for remote workers and digital nomads, this studio provides the perfect base for a workation in Athens.",
  features: [
    "Prime central location in Lycabettus",
    "Ground-floor studio",
    "Quiet and safe environment",
    "Perfect for a workation in Athens",
    "Close to Kolonaki, Syntagma, and major attractions"
  ],
  src: photos[0],
  photos: photos
};

gallery.push(newProp);

const out = 'window.GALLERY = ' + JSON.stringify(gallery, null, 2) + ';\n';
fs.writeFileSync('gallery-data.js', out);

const size = (fs.statSync('gallery-data.js').size / 1024 / 1024).toFixed(2);
console.log(`gallery-data.js written: ${size}MB, ${gallery.length} properties, new has ${photos.length} photos`);
