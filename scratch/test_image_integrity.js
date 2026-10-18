const fs = require('fs');
const path = require('path');

const publicFiles = [
  'index.html',
  'about.html',
  'courses.html',
  'placement.html',
  'affiliation.html',
  'gallery.html',
  'contact.html',
  'verify.html'
];

console.log('=== IMAGE INTEGRITY AUDIT ===\n');

let brokenImagesCount = 0;

publicFiles.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const srcMatches = content.matchAll(/src=["']([^"']+)["']/gi);

  for (const match of srcMatches) {
    let src = match[1].trim();

    // Skip external URLs, data URLs, script sources, template literals
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.endsWith('.js') || src.includes('${') || src === '') {
      continue;
    }

    const cleanSrc = src.split('?')[0].split('#')[0];
    const resolvedPath = path.join(__dirname, '..', cleanSrc);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[BROKEN IMAGE] in ${file}: "${src}" -> File not found`);
      brokenImagesCount++;
    }
  }
});

if (brokenImagesCount === 0) {
  console.log('[PASS] All embedded images exist on the filesystem!');
} else {
  console.error(`[FAIL] Found ${brokenImagesCount} missing images.`);
}
