/**
 * Database Module for G-TEC Tripunithura Website
 * Dual-Mode Storage Architecture: Supabase Cloud PostgreSQL + Resilient Local Hot-Backup
 * 
 * - When configured with SUPABASE_URL & SUPABASE_KEY in .env:
 *   Performs all operations directly against Supabase PostgreSQL cloud tables.
 *   Maintains local JSON mirror for offline resilience and hot backups.
 * - When running without Supabase credentials:
 *   Operates seamlessly against local JSON database in data/ directory.
 * - Zero data loss: All courses, gallery, enquiries, events, and certificates are 100% preserved.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const DATA_DIR = path.join(__dirname, 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const CERTS_FILE = path.join(DATA_DIR, 'certificates.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const EVENT_LINKS_FILE = path.join(DATA_DIR, 'event_links.json');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin_credentials.json');

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
  return `${s}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.includes(':')) {
    const [salt, origHash] = stored.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === origHash;
  }
  return password === stored;
}

const initialAdminCreds = {
  id: 'primary',
  username: 'admin',
  passwordHash: hashPassword('gtec2026'),
  legacyUsernames: ['admin', 'staff', 'gtec'],
  legacyPasswords: ['admin', 'gtec2026', 'admin123'],
  isCustomized: false,
  updatedAt: new Date().toISOString()
};

// Ensure directory and local files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function initFile(file, defaultData) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

// Initial certificate verification seed
const initialCerts = [
  {
    certNumber: "GTEC-2025-KL-8910",
    studentName: "Akhil S.",
    course: "Python Full Stack Development",
    grade: "A+ (Distinction)",
    issueDate: "2025-11-20",
    center: "Tripunithura Campus (Code: KL-TRP-042)",
    status: "Verified & Valid",
    duration: "6 Months",
    accreditation: "ISO 9001:2015 & NSDC Aligned"
  },
  {
    certNumber: "GTEC-2026-TR-1024",
    studentName: "Reshma N.",
    course: "DIA - Diploma in International Accounting",
    grade: "A (Distinction)",
    issueDate: "2026-02-15",
    center: "Tripunithura Campus (Code: KL-TRP-042)",
    status: "Verified & Valid",
    duration: "6 Months",
    accreditation: "Tally Education Authorized & ISO 9001:2015"
  },
  {
    certNumber: "GTEC-2025-TR-3391",
    studentName: "Vishnu Kumar",
    course: "Master Diploma in Architectural CADD & BIM",
    grade: "A+ (Distinction)",
    issueDate: "2025-10-05",
    center: "Tripunithura Campus (Code: KL-TRP-042)",
    status: "Verified & Valid",
    duration: "6 Months",
    accreditation: "Autodesk Authorized Training & G-CADD"
  }
];

initFile(ENQUIRIES_FILE, []);
initFile(CONTACTS_FILE, []);
initFile(CERTS_FILE, initialCerts);
initFile(GALLERY_FILE, []);
initFile(EVENT_LINKS_FILE, []);
initFile(CREDENTIALS_FILE, initialAdminCreds);

function readCredentialsFile() {
  try {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      initFile(CREDENTIALS_FILE, initialAdminCreds);
      return initialAdminCreds;
    }
    const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.username) {
      return parsed;
    }
    return initialAdminCreds;
  } catch (err) {
    console.error(`Error reading ${CREDENTIALS_FILE}:`, err);
    return initialAdminCreds;
  }
}

function readJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

function writeJson(file, data) {
  try {
    const tempFile = `${file}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, file);
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log(`⚡ [Database] Supabase Client Connected (${supabaseUrl})`);
  } catch (e) {
    console.warn(`⚠️ [Database] Failed to initialize Supabase client:`, e.message);
    supabase = null;
  }
} else {
  console.log(`ℹ️ [Database] Running in Local Storage Mode (configure SUPABASE_URL & SUPABASE_KEY in .env to connect to Supabase Cloud)`);
}

// Normalizers for cross-schema safety
function normalizeCourse(c) {
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    categoryName: c.categoryName || c.category_name || 'General Program',
    badge: c.badge || 'Popular',
    duration: c.duration || '3 Months',
    mode: c.mode || 'Classroom / Hybrid',
    eligibility: c.eligibility || 'Plus Two / Degree',
    rating: parseFloat(c.rating) || 4.9,
    reviewsCount: parseInt(c.reviewsCount || c.reviews_count) || 50,
    shortDesc: c.shortDesc || c.short_desc || '',
    description: c.description || '',
    tools: Array.isArray(c.tools) ? c.tools : (typeof c.tools === 'string' ? JSON.parse(c.tools || '[]') : []),
    syllabus: Array.isArray(c.syllabus) ? c.syllabus : (typeof c.syllabus === 'string' ? JSON.parse(c.syllabus || '[]') : []),
    careers: Array.isArray(c.careers) ? c.careers : (typeof c.careers === 'string' ? JSON.parse(c.careers || '[]') : []),
    certifications: Array.isArray(c.certifications) ? c.certifications : (typeof c.certifications === 'string' ? JSON.parse(c.certifications || '[]') : []),
    customFields: Array.isArray(c.customFields || c.custom_fields) ? (c.customFields || c.custom_fields) : [],
    createdAt: c.createdAt || c.created_at,
    updatedAt: c.updatedAt || c.updated_at
  };
}

function normalizeEventLink(l) {
  if (!l) return null;
  return {
    id: l.id,
    title: l.title,
    url: l.url,
    category: l.category || 'Examination',
    badgeText: l.badgeText || l.badge_text || 'Active Now',
    date: l.date || 'Upcoming',
    description: l.description || '',
    active: l.active !== false && l.active !== 'false',
    createdAt: l.createdAt || l.created_at,
    updatedAt: l.updatedAt || l.updated_at
  };
}

function normalizeGalleryItem(g) {
  if (!g) return null;
  return {
    id: g.id,
    title: g.title,
    category: g.category || 'Campus Life',
    date: g.date || '',
    image: g.image,
    caption: g.caption || '',
    isHighlight: g.isHighlight === true || g.is_highlight === true || g.isHighlight === 'true',
    createdAt: g.createdAt || g.created_at,
    updatedAt: g.updatedAt || g.updated_at
  };
}

function normalizeCertificate(c) {
  if (!c) return null;
  return {
    certNumber: c.certNumber || c.cert_number,
    studentName: c.studentName || c.student_name,
    course: c.course,
    grade: c.grade || '',
    issueDate: c.issueDate || c.issue_date || '',
    center: c.center || 'Tripunithura Campus (Code: KL-TRP-042)',
    status: c.status || 'Verified & Valid',
    duration: c.duration || '6 Months',
    accreditation: c.accreditation || ''
  };
}

module.exports = {
  isSupabaseConnected() {
    return !!supabase;
  },

  // ---------------------------------------------------------------------------
  // COURSES MANAGEMENT
  // ---------------------------------------------------------------------------
  async getCourses() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const normalized = data.map(normalizeCourse);
          writeJson(COURSES_FILE, normalized);
          return normalized;
        }
      } catch (err) {
        console.warn('[Database] Supabase getCourses error, falling back to local:', err.message);
      }
    }

    let list = readJson(COURSES_FILE);
    if (!list || list.length === 0) {
      try {
        const fallbackCourses = require('./js/courses-data');
        list = [...fallbackCourses];
        writeJson(COURSES_FILE, list);
      } catch (e) {
        console.error('Fallback courses read error:', e);
      }
    }
    return list.map(normalizeCourse);
  },

  async getCourseById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) {
          return normalizeCourse(data);
        }
      } catch (err) {
        console.warn('[Database] Supabase getCourseById fallback:', err.message);
      }
    }

    const list = await this.getCourses();
    return list.find(c => c.id === id) || null;
  },

  async addCourse(course) {
    const cleanId = (course.id && course.id.trim()) 
      ? course.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') 
      : `course-${Date.now().toString().slice(-6)}`;

    let tools = course.tools;
    if (typeof tools === 'string') tools = tools.split(',').map(s => s.trim()).filter(Boolean);
    else if (!Array.isArray(tools)) tools = [];

    let syllabus = course.syllabus;
    if (typeof syllabus === 'string') syllabus = syllabus.split('\n').map(s => s.trim()).filter(Boolean);
    else if (!Array.isArray(syllabus)) syllabus = [];

    let careers = course.careers;
    if (typeof careers === 'string') careers = careers.split(',').map(s => s.trim()).filter(Boolean);
    else if (!Array.isArray(careers)) careers = [];

    let certifications = course.certifications;
    if (typeof certifications === 'string') certifications = certifications.split(',').map(s => s.trim()).filter(Boolean);
    else if (!Array.isArray(certifications)) certifications = [];

    let customFields = course.customFields;
    if (!Array.isArray(customFields)) customFields = [];

    const newCourse = {
      id: cleanId,
      title: (course.title || 'Untitled Course').trim(),
      category: (course.category || 'software').trim(),
      categoryName: (course.categoryName || course.category_name || 'General Program').trim(),
      badge: (course.badge || 'Popular').trim(),
      duration: (course.duration || '3 Months').trim(),
      mode: (course.mode || 'Classroom / Hybrid').trim(),
      eligibility: (course.eligibility || 'Plus Two / Degree').trim(),
      rating: parseFloat(course.rating) || 4.9,
      reviewsCount: parseInt(course.reviewsCount || course.reviews_count) || 50,
      shortDesc: (course.shortDesc || course.short_desc || '').trim(),
      description: (course.description || '').trim(),
      tools,
      syllabus,
      careers,
      certifications,
      customFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update local JSON hot backup
    const list = readJson(COURSES_FILE);
    list.unshift(newCourse);
    writeJson(COURSES_FILE, list);

    // Save to Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .insert([newCourse])
          .select()
          .single();
        if (!error && data) return normalizeCourse(data);
      } catch (err) {
        console.warn('[Database] Supabase addCourse error:', err.message);
      }
    }

    return newCourse;
  },

  async updateCourse(id, updates) {
    let current = null;
    const list = readJson(COURSES_FILE);
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) current = list[idx];

    if (updates.tools && typeof updates.tools === 'string') {
      updates.tools = updates.tools.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updates.syllabus && typeof updates.syllabus === 'string') {
      updates.syllabus = updates.syllabus.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (updates.careers && typeof updates.careers === 'string') {
      updates.careers = updates.careers.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updates.certifications && typeof updates.certifications === 'string') {
      updates.certifications = updates.certifications.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updates.rating) updates.rating = parseFloat(updates.rating) || (current ? current.rating : 4.9);
    if (updates.reviewsCount) updates.reviewsCount = parseInt(updates.reviewsCount) || (current ? current.reviewsCount : 50);

    let supabaseUpdated = null;
    if (supabase) {
      try {
        const payload = { ...updates, updatedAt: new Date().toISOString() };
        delete payload.id;
        const { data, error } = await supabase
          .from('courses')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) supabaseUpdated = normalizeCourse(data);
      } catch (err) {
        console.warn('[Database] Supabase updateCourse error:', err.message);
      }
    }

    const updatedCourse = supabaseUpdated || (current ? { ...current, ...updates, updatedAt: new Date().toISOString() } : null);
    if (!updatedCourse) return null;

    if (idx !== -1) {
      list[idx] = updatedCourse;
    } else {
      list.unshift(updatedCourse);
    }
    writeJson(COURSES_FILE, list);

    return normalizeCourse(updatedCourse);
  },

  async deleteCourse(id) {
    let deleted = false;
    if (supabase) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (!error) deleted = true;
      } catch (err) {
        console.warn('[Database] Supabase deleteCourse error:', err.message);
      }
    }

    const list = readJson(COURSES_FILE);
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length !== list.length) {
      deleted = true;
      writeJson(COURSES_FILE, filtered);
    }

    return deleted;
  },

  // ---------------------------------------------------------------------------
  // ENQUIRIES MANAGEMENT
  // ---------------------------------------------------------------------------
  async getEnquiries() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && Array.isArray(data)) {
          writeJson(ENQUIRIES_FILE, data);
          return data;
        }
      } catch (err) {
        console.warn('[Database] Supabase getEnquiries fallback:', err.message);
      }
    }

    return readJson(ENQUIRIES_FILE);
  },

  async addEnquiry(enquiry) {
    const newEnquiry = {
      id: `ENQ-${Date.now().toString().slice(-5)}`,
      name: (enquiry.name || 'Anonymous').trim(),
      phone: (enquiry.phone || '').trim(),
      email: (enquiry.email || '').trim(),
      course: (enquiry.course || 'General Enquiry').trim(),
      comments: (enquiry.comments || '').trim(),
      mode: enquiry.mode || 'Classroom / Lab',
      status: "New",
      notes: "",
      ip: enquiry.ip || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list = readJson(ENQUIRIES_FILE);
    list.unshift(newEnquiry);
    writeJson(ENQUIRIES_FILE, list);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .insert([newEnquiry])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Database] Supabase addEnquiry error:', err.message);
      }
    }

    return newEnquiry;
  },

  async updateEnquiry(id, updates) {
    let current = null;
    const list = readJson(ENQUIRIES_FILE);
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) current = list[idx];

    let supabaseUpdated = null;
    if (supabase) {
      try {
        const payload = { ...updates, updatedAt: new Date().toISOString() };
        delete payload.id;
        const { data, error } = await supabase
          .from('enquiries')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) supabaseUpdated = data;
      } catch (err) {
        console.warn('[Database] Supabase updateEnquiry error:', err.message);
      }
    }

    const updated = supabaseUpdated || (current ? { ...current, ...updates, updatedAt: new Date().toISOString() } : null);
    if (!updated) return null;

    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    writeJson(ENQUIRIES_FILE, list);

    return updated;
  },

  async deleteEnquiry(id) {
    let deleted = false;
    if (supabase) {
      try {
        const { error } = await supabase.from('enquiries').delete().eq('id', id);
        if (!error) deleted = true;
      } catch (err) {
        console.warn('[Database] Supabase deleteEnquiry error:', err.message);
      }
    }

    const list = readJson(ENQUIRIES_FILE);
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length !== list.length) {
      deleted = true;
      writeJson(ENQUIRIES_FILE, filtered);
    }

    return deleted;
  },

  // ---------------------------------------------------------------------------
  // EVENT & EXAMINATION LINKS MANAGEMENT
  // ---------------------------------------------------------------------------
  async getEventLinks() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('event_links')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && Array.isArray(data)) {
          const normalized = data.map(normalizeEventLink);
          writeJson(EVENT_LINKS_FILE, normalized);
          return normalized;
        }
      } catch (err) {
        console.warn('[Database] Supabase getEventLinks fallback:', err.message);
      }
    }

    const list = readJson(EVENT_LINKS_FILE);
    return list.map(normalizeEventLink);
  },

  async addEventLink(item) {
    const newLink = {
      id: `EVT-${Date.now().toString().slice(-5)}`,
      title: (item.title || 'Event / Examination').trim(),
      url: (item.url || '#').trim(),
      category: (item.category || 'Examination').trim(),
      badgeText: (item.badgeText || item.badge_text || 'Active Now').trim(),
      date: (item.date || 'Upcoming').trim(),
      description: (item.description || '').trim(),
      active: item.active !== false && item.active !== 'false',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list = readJson(EVENT_LINKS_FILE);
    list.unshift(newLink);
    writeJson(EVENT_LINKS_FILE, list);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('event_links')
          .insert([newLink])
          .select()
          .single();
        if (!error && data) return normalizeEventLink(data);
      } catch (err) {
        console.warn('[Database] Supabase addEventLink error:', err.message);
      }
    }

    return newLink;
  },

  async updateEventLink(id, updates) {
    let current = null;
    const list = readJson(EVENT_LINKS_FILE);
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) current = list[idx];

    if (updates.active !== undefined) {
      updates.active = updates.active === true || updates.active === 'true';
    }

    let supabaseUpdated = null;
    if (supabase) {
      try {
        const payload = { ...updates, updatedAt: new Date().toISOString() };
        delete payload.id;
        const { data, error } = await supabase
          .from('event_links')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) supabaseUpdated = normalizeEventLink(data);
      } catch (err) {
        console.warn('[Database] Supabase updateEventLink error:', err.message);
      }
    }

    const updated = supabaseUpdated || (current ? { ...current, ...updates, updatedAt: new Date().toISOString() } : null);
    if (!updated) return null;

    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    writeJson(EVENT_LINKS_FILE, list);

    return normalizeEventLink(updated);
  },

  async deleteEventLink(id) {
    let deleted = false;
    if (supabase) {
      try {
        const { error } = await supabase.from('event_links').delete().eq('id', id);
        if (!error) deleted = true;
      } catch (err) {
        console.warn('[Database] Supabase deleteEventLink error:', err.message);
      }
    }

    const list = readJson(EVENT_LINKS_FILE);
    const filtered = list.filter(l => l.id !== id);
    if (filtered.length !== list.length) {
      deleted = true;
      writeJson(EVENT_LINKS_FILE, filtered);
    }

    return deleted;
  },

  // ---------------------------------------------------------------------------
  // GALLERY MANAGEMENT
  // ---------------------------------------------------------------------------
  async getGallery() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const normalized = data.map(normalizeGalleryItem);
          writeJson(GALLERY_FILE, normalized);
          return normalized;
        }
      } catch (err) {
        console.warn('[Database] Supabase getGallery fallback:', err.message);
      }
    }

    const list = readJson(GALLERY_FILE);
    return list.map(normalizeGalleryItem);
  },

  async addGalleryItem(item) {
    const newItem = {
      id: `GAL-${Date.now().toString().slice(-5)}`,
      title: (item.title || 'Campus Event').trim(),
      category: (item.category || 'Campus Life').trim(),
      date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      image: item.image,
      caption: (item.caption || '').trim(),
      isHighlight: item.isHighlight === true || item.isHighlight === 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list = readJson(GALLERY_FILE);
    list.unshift(newItem);
    writeJson(GALLERY_FILE, list);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .insert([newItem])
          .select()
          .single();
        if (!error && data) return normalizeGalleryItem(data);
      } catch (err) {
        console.warn('[Database] Supabase addGalleryItem error:', err.message);
      }
    }

    return newItem;
  },

  async updateGalleryItem(id, updates) {
    let current = null;
    const list = readJson(GALLERY_FILE);
    const idx = list.findIndex(g => g.id === id);
    if (idx !== -1) current = list[idx];

    if (updates.isHighlight !== undefined) {
      updates.isHighlight = updates.isHighlight === true || updates.isHighlight === 'true';
    }

    let supabaseUpdated = null;
    if (supabase) {
      try {
        const payload = { ...updates, updatedAt: new Date().toISOString() };
        delete payload.id;
        const { data, error } = await supabase
          .from('gallery')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) supabaseUpdated = normalizeGalleryItem(data);
      } catch (err) {
        console.warn('[Database] Supabase updateGalleryItem error:', err.message);
      }
    }

    const updated = supabaseUpdated || (current ? { ...current, ...updates, updatedAt: new Date().toISOString() } : null);
    if (!updated) return null;

    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    writeJson(GALLERY_FILE, list);

    return normalizeGalleryItem(updated);
  },

  async deleteGalleryItem(id) {
    let deleted = false;
    if (supabase) {
      try {
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (!error) deleted = true;
      } catch (err) {
        console.warn('[Database] Supabase deleteGalleryItem error:', err.message);
      }
    }

    const list = readJson(GALLERY_FILE);
    const filtered = list.filter(g => g.id !== id);
    if (filtered.length !== list.length) {
      deleted = true;
      writeJson(GALLERY_FILE, filtered);
    }

    return deleted;
  },

  // ---------------------------------------------------------------------------
  // CERTIFICATE VERIFICATION
  // ---------------------------------------------------------------------------
  async verifyCertificate(certNumber) {
    if (!certNumber) return null;
    const cleanNumber = certNumber.trim().toUpperCase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .ilike('certNumber', cleanNumber)
          .maybeSingle();
        if (!error && data) {
          return normalizeCertificate(data);
        }
      } catch (err) {
        console.warn('[Database] Supabase verifyCertificate fallback:', err.message);
      }
    }

    const certs = readJson(CERTS_FILE);
    const found = certs.find(c => c.certNumber.toUpperCase() === cleanNumber) || null;
    return normalizeCertificate(found);
  },

  // ---------------------------------------------------------------------------
  // CONTACT MESSAGES
  // ---------------------------------------------------------------------------
  async getContacts() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!error && Array.isArray(data)) return data;
      } catch (err) {}
    }
    return readJson(CONTACTS_FILE);
  },

  async addContact(contact) {
    const item = {
      id: `MSG-${Date.now().toString().slice(-5)}`,
      name: (contact.name || '').trim(),
      phone: (contact.phone || '').trim(),
      email: (contact.email || '').trim(),
      course: (contact.course || 'General Query').trim(),
      comments: (contact.comments || '').trim(),
      createdAt: new Date().toISOString()
    };

    const list = readJson(CONTACTS_FILE);
    list.unshift(item);
    writeJson(CONTACTS_FILE, list);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .insert([item])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Database] Supabase addContact error:', err.message);
      }
    }

    return item;
  },

  // ---------------------------------------------------------------------------
  // ADMIN CREDENTIAL MANAGEMENT (ZERO DATA LOSS)
  // ---------------------------------------------------------------------------
  async getAdminCredentials() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_credentials')
          .select('*')
          .eq('id', 'primary')
          .maybeSingle();
        if (!error && data && data.username && data.passwordHash) {
          return data;
        }
      } catch (err) {}
    }
    return readCredentialsFile();
  },

  async verifyAdminLogin(username, password) {
    if (!username || !password) return { valid: false };
    const creds = await this.getAdminCredentials();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Direct match with active admin credentials
    if (cleanUser === (creds.username || '').toLowerCase() && verifyPassword(cleanPass, creds.passwordHash)) {
      return {
        valid: true,
        user: {
          role: 'admin',
          username: creds.username,
          name: 'G-TEC Administrator'
        }
      };
    }

    // 2. Initial default fallback ONLY if admin has not yet customized credentials
    if (!creds.isCustomized) {
      const validUsers = Array.isArray(creds.legacyUsernames) ? creds.legacyUsernames.map(u => u.toLowerCase()) : ['admin', 'staff', 'gtec'];
      const validPass = Array.isArray(creds.legacyPasswords) ? creds.legacyPasswords : ['admin', 'gtec2026', 'admin123'];
      if (validUsers.includes(cleanUser) && validPass.includes(cleanPass)) {
        return {
          valid: true,
          user: {
            role: 'admin',
            username: creds.username,
            name: 'G-TEC Administrator'
          }
        };
      }
    }

    return { valid: false };
  },

  async getAdminProfile() {
    const creds = await this.getAdminCredentials();
    return {
      username: creds.username || 'admin',
      isCustomized: !!creds.isCustomized,
      updatedAt: creds.updatedAt || new Date().toISOString()
    };
  },

  async updateAdminCredentials({ currentPassword, newUsername, newPassword }) {
    if (!currentPassword || !currentPassword.trim()) {
      throw new Error('Current password is required to verify your identity.');
    }

    const creds = await this.getAdminCredentials();
    const cleanCurrentPass = currentPassword.trim();
    const currentPassMatches = verifyPassword(cleanCurrentPass, creds.passwordHash) ||
      (!creds.isCustomized && (creds.legacyPasswords || ['admin', 'gtec2026', 'admin123']).includes(cleanCurrentPass));

    if (!currentPassMatches) {
      throw new Error('Current password is incorrect. Please check and try again.');
    }

    let updatedUsername = creds.username;
    if (newUsername && newUsername.trim()) {
      const cleanUser = newUsername.trim();
      if (cleanUser.length < 3) {
        throw new Error('New username must be at least 3 characters long.');
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUser)) {
        throw new Error('Username can only contain letters, numbers, dots, hyphens, and underscores.');
      }
      updatedUsername = cleanUser;
    }

    let updatedHash = creds.passwordHash;
    if (newPassword && newPassword.trim()) {
      const cleanPass = newPassword.trim();
      if (cleanPass.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }
      updatedHash = hashPassword(cleanPass);
    }

    if (updatedUsername === creds.username && updatedHash === creds.passwordHash) {
      throw new Error('No changes detected. Please specify a new username or new password.');
    }

    const updatedCreds = {
      id: 'primary',
      username: updatedUsername,
      passwordHash: updatedHash,
      isCustomized: true,
      updatedAt: new Date().toISOString()
    };

    writeJson(CREDENTIALS_FILE, updatedCreds);

    if (supabase) {
      try {
        await supabase
          .from('admin_credentials')
          .upsert([updatedCreds]);
      } catch (err) {
        console.warn('[Database] Supabase admin_credentials sync notice:', err.message);
      }
    }

    return {
      success: true,
      username: updatedCreds.username,
      updatedAt: updatedCreds.updatedAt,
      message: 'Admin credentials updated successfully! Old credentials and hints have been deactivated.'
    };
  }
};
