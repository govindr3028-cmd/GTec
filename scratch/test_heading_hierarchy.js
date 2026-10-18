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

console.log('=== HEADING HIERARCHY AUDIT ===\n');

publicFiles.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  // strip scripts and styles
  const cleanContent = content.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');

  const headings = [...cleanContent.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ({
    tag: m[1].toLowerCase(),
    level: parseInt(m[1][1]),
    text: m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')
  }));

  console.log(`\nFile: ${file} (Total headings: ${headings.length})`);
  const h1s = headings.filter(h => h.level === 1);
  if (h1s.length !== 1) {
    console.error(`  [FAIL] Expected exactly 1 H1, found ${h1s.length}`);
  } else {
    console.log(`  [OK] H1: "${h1s[0].text}"`);
  }

  // Check if any heading appears before H1
  const h1Index = headings.findIndex(h => h.level === 1);
  if (h1Index > 0) {
    console.warn(`  [WARN] Heading before H1: <${headings[0].tag}> "${headings[0].text}"`);
  } else {
    console.log(`  [OK] H1 is the first heading on the page.`);
  }

  // Print outline
  const outline = headings.slice(0, 8).map(h => `${'  '.repeat(h.level - 1)}<${h.tag}> ${h.text.substring(0, 40)}...`).join('\n');
  console.log(`  Outline sample:\n${outline}`);
});
