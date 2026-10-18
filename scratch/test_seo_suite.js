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

console.log('=== SEO VERIFICATION TEST SUITE ===\n');

let allPassed = true;

// 1. Check title, meta description, canonical, robots, OG, Twitter, JSON-LD, H1
publicFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] File missing: ${file}`);
    allPassed = false;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const desc = descMatch ? descMatch[1].trim() : null;

  // Canonical
  const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const canonical = canonMatch ? canonMatch[1].trim() : null;

  // Robots
  const robotsMatch = content.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const robots = robotsMatch ? robotsMatch[1].trim() : null;

  // Open Graph
  const ogTitle = content.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const ogImage = content.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

  // Twitter
  const twCard = content.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);

  // H1 count
  const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];

  // JSON-LD scripts
  const jsonLdMatches = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];
  let jsonLdValid = true;
  let parsedJsonLdCount = 0;
  jsonLdMatches.forEach(tag => {
    const raw = tag.replace(/<script\s+type=["']application\/ld\+json["']>/i, '').replace(/<\/script>/i, '').trim();
    try {
      JSON.parse(raw);
      parsedJsonLdCount++;
    } catch (e) {
      jsonLdValid = false;
      console.error(`  [JSON-LD ERROR in ${file}]:`, e.message);
    }
  });

  const passed = title && desc && canonical && robots && ogTitle && ogImage && twCard && h1Matches.length === 1 && jsonLdValid && parsedJsonLdCount > 0;

  if (passed) {
    console.log(`[PASS] ${file}:`);
    console.log(`  - Title: "${title}" (${title.length} chars)`);
    console.log(`  - Desc: "${desc.substring(0, 60)}..." (${desc.length} chars)`);
    console.log(`  - Canonical: ${canonical}`);
    console.log(`  - H1 count: ${h1Matches.length} (${h1Matches[0].replace(/<[^>]+>/g, '').trim()})`);
    console.log(`  - JSON-LD blocks: ${parsedJsonLdCount} (valid JSON)`);
  } else {
    console.error(`[FAIL] ${file}:`);
    if (!title) console.error('  - Missing title');
    if (!desc) console.error('  - Missing meta description');
    if (!canonical) console.error('  - Missing canonical');
    if (!robots) console.error('  - Missing robots meta');
    if (!ogTitle) console.error('  - Missing OG title');
    if (!twCard) console.error('  - Missing Twitter card');
    if (h1Matches.length !== 1) console.error(`  - Invalid H1 count: ${h1Matches.length}`);
    if (!jsonLdValid || parsedJsonLdCount === 0) console.error('  - Missing or invalid JSON-LD');
    allPassed = false;
  }
});

// 2. Check admin.html has noindex
const adminContent = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
const adminNoindex = adminContent.includes('noindex');
console.log(`\n[${adminNoindex ? 'PASS' : 'FAIL'}] admin.html: Contains noindex directive: ${adminNoindex}`);

// 3. Check robots.txt
const robotsTxt = fs.readFileSync(path.join(__dirname, '..', 'robots.txt'), 'utf8');
const robotsHasDisallow = robotsTxt.includes('Disallow: /admin') && robotsTxt.includes('Sitemap: https://gtectripunithura.com/sitemap.xml');
console.log(`[${robotsHasDisallow ? 'PASS' : 'FAIL'}] robots.txt: Disallows admin and includes sitemap: ${robotsHasDisallow}`);

// 4. Check sitemap.xml
const sitemapXml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
const sitemapUrlCount = (sitemapXml.match(/<loc>/g) || []).length;
console.log(`[${sitemapUrlCount === 8 ? 'PASS' : 'FAIL'}] sitemap.xml: Has ${sitemapUrlCount} URLs (expected 8)`);

console.log(`\nOverall Static Verification: ${allPassed ? 'ALL PASSED' : 'SOME CHECKS FAILED'}`);
