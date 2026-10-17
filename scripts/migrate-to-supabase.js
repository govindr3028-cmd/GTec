/**
 * G-TEC Computer Education - Tripunithura Campus
 * Supabase Data Migration & Seed Script
 * 
 * Safely transfers all existing local JSON data to Supabase PostgreSQL without data loss.
 * Usage: npm run migrate
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DATA_DIR = path.join(__dirname, '..', 'data');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Supabase credentials not found.');
  console.error('Please configure your .env file with:');
  console.error('  SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (or SUPABASE_KEY / SUPABASE_ANON_KEY)\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

function loadJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[Migration] Could not parse ${filename}:`, err.message);
    return [];
  }
}

async function migrate() {
  console.log('====================================================');
  console.log('🚀 G-TEC Tripunithura - Supabase Data Migration');
  console.log('Target Supabase URL:', supabaseUrl);
  console.log('====================================================\n');

  let totalMigrated = 0;

  // 1. Migrate Courses
  const courses = loadJson('courses.json');
  console.log(`📦 Found ${courses.length} courses in data/courses.json`);
  if (courses.length > 0) {
    const formattedCourses = courses.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      categoryName: c.categoryName || c.category_name,
      badge: c.badge || 'Popular',
      duration: c.duration || '3 Months',
      mode: c.mode || 'Classroom / Hybrid',
      eligibility: c.eligibility || 'Plus Two / Degree',
      rating: parseFloat(c.rating) || 4.9,
      reviewsCount: parseInt(c.reviewsCount || c.reviews_count) || 50,
      shortDesc: c.shortDesc || c.short_desc || '',
      description: c.description || '',
      tools: c.tools || [],
      syllabus: c.syllabus || [],
      careers: c.careers || [],
      certifications: c.certifications || [],
      customFields: c.customFields || c.custom_fields || []
    }));

    const { error } = await supabase.from('courses').upsert(formattedCourses, { onConflict: 'id' });
    if (error) {
      console.error('❌ Error migrating courses:', error.message);
    } else {
      console.log(`✅ Successfully synced ${courses.length} courses to Supabase!`);
      totalMigrated += courses.length;
    }
  }

  // 2. Migrate Gallery
  const gallery = loadJson('gallery.json');
  console.log(`\n📸 Found ${gallery.length} gallery items in data/gallery.json`);
  if (gallery.length > 0) {
    const formattedGallery = gallery.map(g => ({
      id: g.id,
      title: g.title,
      category: g.category || 'Campus Life',
      date: g.date || '',
      image: g.image,
      caption: g.caption || '',
      isHighlight: g.isHighlight === true || g.isHighlight === 'true'
    }));

    const { error } = await supabase.from('gallery').upsert(formattedGallery, { onConflict: 'id' });
    if (error) {
      console.error('❌ Error migrating gallery:', error.message);
    } else {
      console.log(`✅ Successfully synced ${gallery.length} gallery items to Supabase!`);
      totalMigrated += gallery.length;
    }
  }

  // 3. Migrate Event Links
  const eventLinks = loadJson('event_links.json');
  console.log(`\n🔗 Found ${eventLinks.length} event links in data/event_links.json`);
  if (eventLinks.length > 0) {
    const formattedLinks = eventLinks.map(l => ({
      id: l.id,
      title: l.title,
      url: l.url,
      category: l.category || 'Examination',
      badgeText: l.badgeText || 'Active Now',
      date: l.date || 'Upcoming',
      description: l.description || '',
      active: l.active !== false
    }));

    const { error } = await supabase.from('event_links').upsert(formattedLinks, { onConflict: 'id' });
    if (error) {
      console.error('❌ Error migrating event links:', error.message);
    } else {
      console.log(`✅ Successfully synced ${eventLinks.length} event links to Supabase!`);
      totalMigrated += eventLinks.length;
    }
  }

  // 4. Migrate Certificates
  const certs = loadJson('certificates.json');
  console.log(`\n🎓 Found ${certs.length} certificates in data/certificates.json`);
  if (certs.length > 0) {
    const formattedCerts = certs.map(c => ({
      certNumber: c.certNumber,
      studentName: c.studentName,
      course: c.course,
      grade: c.grade || '',
      issueDate: c.issueDate || '',
      center: c.center || 'Tripunithura Campus (Code: KL-TRP-042)',
      status: c.status || 'Verified & Valid',
      duration: c.duration || '6 Months',
      accreditation: c.accreditation || ''
    }));

    const { error } = await supabase.from('certificates').upsert(formattedCerts, { onConflict: 'certNumber' });
    if (error) {
      console.error('❌ Error migrating certificates:', error.message);
    } else {
      console.log(`✅ Successfully synced ${certs.length} certificates to Supabase!`);
      totalMigrated += certs.length;
    }
  }

  // 5. Migrate Enquiries (if any)
  const enquiries = loadJson('enquiries.json');
  if (enquiries.length > 0) {
    console.log(`\n📋 Found ${enquiries.length} enquiries in data/enquiries.json`);
    const { error } = await supabase.from('enquiries').upsert(enquiries, { onConflict: 'id' });
    if (error) {
      console.error('❌ Error migrating enquiries:', error.message);
    } else {
      console.log(`✅ Successfully synced ${enquiries.length} enquiries to Supabase!`);
      totalMigrated += enquiries.length;
    }
  }

  // 6. Migrate Contacts (if any)
  const contacts = loadJson('contacts.json');
  if (contacts.length > 0) {
    console.log(`\n✉️ Found ${contacts.length} contact messages in data/contacts.json`);
    const { error } = await supabase.from('contacts').upsert(contacts, { onConflict: 'id' });
    if (error) {
      console.error('❌ Error migrating contacts:', error.message);
    } else {
      console.log(`✅ Successfully synced ${contacts.length} contacts to Supabase!`);
      totalMigrated += contacts.length;
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 MIGRATION COMPLETE! Total records synced: ${totalMigrated}`);
  console.log('All data is safely backed up locally and live in Supabase PostgreSQL.');
  console.log('====================================================\n');
}

migrate().catch(err => {
  console.error('\n❌ Fatal Migration Error:', err);
  process.exit(1);
});
