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

console.log('=== INTERNAL LINK INTEGRITY AUDIT ===\n');

let brokenLinksCount = 0;

publicFiles.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const hrefMatches = content.matchAll(/href=["']([^"']+)["']/gi);

  for (const match of hrefMatches) {
    let link = match[1].trim();

    // Skip anchors, tel, mailto, javascript, external links
    if (link.startsWith('#') || link.startsWith('tel:') || link.startsWith('mailto:') || link.startsWith('javascript:') || link.startsWith('http://') || link.startsWith('https://')) {
      continue;
    }

    // Strip query strings or hash
    const cleanLink = link.split('?')[0].split('#')[0];
    if (!cleanLink) continue;

    // Check if relative file exists
    const resolvedPath = path.join(__dirname, '..', cleanLink);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[BROKEN LINK] in ${file}: "${link}" -> File not found: ${cleanLink}`);
      brokenLinksCount++;
    }
  }
});

if (brokenLinksCount === 0) {
  console.log('[PASS] All internal anchor links point to valid files!');
} else {
  console.error(`[FAIL] Found ${brokenLinksCount} broken internal links.`);
}
