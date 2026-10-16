/**
 * Database Module for G-TEC Tripunithura Website
 * Provides persistent, atomic storage for enquiries, contact messages, and certificate verification.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const CERTS_FILE = path.join(DATA_DIR, 'certificates.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const EVENT_LINKS_FILE = path.join(DATA_DIR, 'event_links.json');

// Ensure directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function initFile(file, defaultData) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

// Initial sample certificate verification database
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

// Initial sample inquiries for admin demo
const initialEnquiries = [
  {
    id: "ENQ-1001",
    name: "Sujith M. Menon",
    phone: "9847123456",
    email: "sujith.menon@gmail.com",
    course: "Python Full Stack Development",
    comments: "Interested in the upcoming weekend batch. Please share fee structure.",
    mode: "Weekend",
    status: "New",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: ""
  },
  {
    id: "ENQ-1002",
    name: "Ananya Pillai",
    phone: "9495678901",
    email: "ananya.p@outlook.com",
    course: "DIA - Diploma in International Accounting",
    comments: "Completed B.Com last year. Looking for GCC VAT and TallyPrime training with Gulf placement.",
    mode: "Classroom",
    status: "Contacted",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: "Spoke to student. Scheduled demo class for Saturday."
  }
];

initFile(ENQUIRIES_FILE, initialEnquiries);
initFile(CONTACTS_FILE, []);
initFile(CERTS_FILE, initialCerts);

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
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, file);
}

module.exports = {
  // Enquiries
  getEnquiries() {
    return readJson(ENQUIRIES_FILE);
  },
  addEnquiry(enquiry) {
    const list = readJson(ENQUIRIES_FILE);
    const newEnquiry = {
      id: `ENQ-${Date.now().toString().slice(-5)}`,
      status: "New",
      createdAt: new Date().toISOString(),
      notes: "",
      ...enquiry
    };
    list.unshift(newEnquiry);
    writeJson(ENQUIRIES_FILE, list);
    return newEnquiry;
  },
  updateEnquiry(id, updates) {
    const list = readJson(ENQUIRIES_FILE);
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJson(ENQUIRIES_FILE, list);
    return list[idx];
  },
  deleteEnquiry(id) {
    const list = readJson(ENQUIRIES_FILE);
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length === list.length) return false;
    writeJson(ENQUIRIES_FILE, filtered);
    return true;
  },

  // Contact Messages
  getContacts() {
    return readJson(CONTACTS_FILE);
  },
  addContact(contact) {
    const list = readJson(CONTACTS_FILE);
    const item = {
      id: `MSG-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
      ...contact
    };
    list.unshift(item);
    writeJson(CONTACTS_FILE, list);
    return item;
  },

  // Certificate Verification
  verifyCertificate(certNumber) {
    if (!certNumber) return null;
    const cleanNumber = certNumber.trim().toUpperCase();
    const certs = readJson(CERTS_FILE);
    return certs.find(c => c.certNumber.toUpperCase() === cleanNumber) || null;
  },

  // Gallery & Highlights
  getGallery() {
    return readJson(GALLERY_FILE);
  },
  addGalleryItem(item) {
    const list = readJson(GALLERY_FILE);
    const newItem = {
      id: `GAL-${Date.now().toString().slice(-5)}`,
      title: item.title || 'Campus Event',
      category: item.category || 'Campus Life',
      date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      image: item.image,
      caption: item.caption || '',
      isHighlight: item.isHighlight === true || item.isHighlight === 'true',
      createdAt: new Date().toISOString()
    };
    list.unshift(newItem);
    writeJson(GALLERY_FILE, list);
    return newItem;
  },
  updateGalleryItem(id, updates) {
    const list = readJson(GALLERY_FILE);
    const idx = list.findIndex(g => g.id === id);
    if (idx === -1) return null;
    if (updates.isHighlight !== undefined) {
      updates.isHighlight = updates.isHighlight === true || updates.isHighlight === 'true';
    }
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJson(GALLERY_FILE, list);
    return list[idx];
  },
  deleteGalleryItem(id) {
    const list = readJson(GALLERY_FILE);
    const filtered = list.filter(g => g.id !== id);
    if (filtered.length === list.length) return false;
    writeJson(GALLERY_FILE, filtered);
    return true;
  },

  // Event & Examination Links
  getEventLinks() {
    return readJson(EVENT_LINKS_FILE);
  },
  addEventLink(item) {
    const list = readJson(EVENT_LINKS_FILE);
    const newLink = {
      id: `EVT-${Date.now().toString().slice(-5)}`,
      title: (item.title || 'Event / Examination').trim(),
      url: (item.url || '#').trim(),
      category: (item.category || 'Examination').trim(),
      badgeText: (item.badgeText || 'Active Now').trim(),
      date: (item.date || 'Upcoming').trim(),
      description: (item.description || '').trim(),
      active: item.active !== false && item.active !== 'false',
      createdAt: new Date().toISOString()
    };
    list.unshift(newLink);
    writeJson(EVENT_LINKS_FILE, list);
    return newLink;
  },
  updateEventLink(id, updates) {
    const list = readJson(EVENT_LINKS_FILE);
    const idx = list.findIndex(l => l.id === id);
    if (idx === -1) return null;
    if (updates.active !== undefined) {
      updates.active = updates.active === true || updates.active === 'true';
    }
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJson(EVENT_LINKS_FILE, list);
    return list[idx];
  },
  deleteEventLink(id) {
    const list = readJson(EVENT_LINKS_FILE);
    const filtered = list.filter(l => l.id !== id);
    if (filtered.length === list.length) return false;
    writeJson(EVENT_LINKS_FILE, filtered);
    return true;
  },

  // Courses Management (Full Access)
  getCourses() {
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
    return list;
  },
  getCourseById(id) {
    const list = this.getCourses();
    return list.find(c => c.id === id) || null;
  },
  addCourse(course) {
    const list = this.getCourses();
    const cleanId = (course.id && course.id.trim()) 
      ? course.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') 
      : `course-${Date.now().toString().slice(-6)}`;
      
    // Format tools
    let tools = course.tools;
    if (typeof tools === 'string') {
      tools = tools.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(tools)) {
      tools = [];
    }

    // Format syllabus
    let syllabus = course.syllabus;
    if (typeof syllabus === 'string') {
      syllabus = syllabus.split('\n').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(syllabus)) {
      syllabus = [];
    }

    // Format careers
    let careers = course.careers;
    if (typeof careers === 'string') {
      careers = careers.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(careers)) {
      careers = [];
    }

    // Format certifications
    let certifications = course.certifications;
    if (typeof certifications === 'string') {
      certifications = certifications.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(certifications)) {
      certifications = [];
    }

    // Format customFields
    let customFields = course.customFields;
    if (!Array.isArray(customFields)) {
      customFields = [];
    }

    const newCourse = {
      id: cleanId,
      title: (course.title || 'Untitled Course').trim(),
      category: (course.category || 'software').trim(),
      categoryName: (course.categoryName || 'General Program').trim(),
      badge: (course.badge || 'Popular').trim(),
      duration: (course.duration || '3 Months').trim(),
      mode: (course.mode || 'Classroom / Hybrid').trim(),
      eligibility: (course.eligibility || 'Plus Two / Degree').trim(),
      rating: parseFloat(course.rating) || 4.9,
      reviewsCount: parseInt(course.reviewsCount) || 50,
      shortDesc: (course.shortDesc || '').trim(),
      description: (course.description || '').trim(),
      tools,
      syllabus,
      careers,
      certifications,
      customFields,
      createdAt: new Date().toISOString()
    };

    list.unshift(newCourse);
    writeJson(COURSES_FILE, list);
    return newCourse;
  },
  updateCourse(id, updates) {
    const list = this.getCourses();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return null;

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
    if (updates.rating) updates.rating = parseFloat(updates.rating) || list[idx].rating;
    if (updates.reviewsCount) updates.reviewsCount = parseInt(updates.reviewsCount) || list[idx].reviewsCount;

    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJson(COURSES_FILE, list);
    return list[idx];
  },
  deleteCourse(id) {
    const list = this.getCourses();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) return false;
    writeJson(COURSES_FILE, filtered);
    return true;
  }
};
