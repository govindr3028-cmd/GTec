const http = require('http');

const endpoints = [
  { path: '/', expectedCode: 200, expectedType: 'text/html' },
  { path: '/about', expectedCode: 200, expectedType: 'text/html' },
  { path: '/courses', expectedCode: 200, expectedType: 'text/html' },
  { path: '/placement', expectedCode: 200, expectedType: 'text/html' },
  { path: '/affiliation', expectedCode: 200, expectedType: 'text/html' },
  { path: '/gallery', expectedCode: 200, expectedType: 'text/html' },
  { path: '/contact', expectedCode: 200, expectedType: 'text/html' },
  { path: '/verify', expectedCode: 200, expectedType: 'text/html' },
  { path: '/robots.txt', expectedCode: 200, expectedType: 'text/plain' },
  { path: '/sitemap.xml', expectedCode: 200, expectedType: 'application/xml' },
  { path: '/admin', expectedCode: 200, expectedType: 'text/html' },
  { path: '/images/our-awards-01.jpg', expectedCode: 200, expectedType: 'image/jpeg' },
  { path: '/api/verify/GTEC-2025-KL-8910', expectedCode: 200, expectedType: 'application/json' },
  { path: '/api/admin/enquiries', expectedCode: 200, expectedType: 'application/json' }
];

console.log('=== HTTP ENDPOINT & FUNCTIONALITY TEST SUITE ===\n');

function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8080${endpoint.path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const statusOk = res.statusCode === endpoint.expectedCode;
        const typeOk = contentType.includes(endpoint.expectedType);

        if (statusOk && typeOk) {
          console.log(`[PASS] ${endpoint.path} -> ${res.statusCode} (${contentType.split(';')[0]})`);
          resolve(true);
        } else {
          console.error(`[FAIL] ${endpoint.path} -> Got ${res.statusCode} (expected ${endpoint.expectedCode}), Content-Type: ${contentType} (expected ${endpoint.expectedType})`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error(`[FAIL] ${endpoint.path} -> Connection error: ${err.message}`);
      resolve(false);
    });
  });
}

async function runAll() {
  let allOk = true;
  for (const ep of endpoints) {
    const ok = await checkEndpoint(ep);
    if (!ok) allOk = false;
  }
  console.log(`\nHTTP Test Suite Result: ${allOk ? 'ALL ENDPOINTS HEALTHY (100% PASS)' : 'SOME TESTS FAILED'}`);
}

runAll();
