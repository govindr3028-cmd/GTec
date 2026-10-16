/**
 * G-TEC Computer Education - Tripunithura Campus
 * Production Express Backend Server
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const coursesData = require('./js/courses-data');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware (with 25MB body limit for image uploads)
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve Static Assets
app.use(express.static(path.join(__dirname), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

/* ==========================================================================
   Public API Routes
   ========================================================================== */

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    center: 'G-TEC Tripunithura Campus (Kochi)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Get Courses with optional filtering
app.get('/api/courses', (req, res) => {
  const { category, search } = req.query;
  let results = db.getCourses();

  if (category && category !== 'all') {
    results = results.filter(c => c.category === category);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(c => 
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.tools && Array.isArray(c.tools) && c.tools.some(t => t.toLowerCase().includes(q))) ||
      (c.shortDesc && c.shortDesc.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: results.length,
    courses: results
  });
});

// Get Single Course Details
app.get('/api/courses/:id', (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  res.json({ success: true, course });
});

// Add New Course (Admin Full Access)
app.post(['/api/admin/courses', '/api/courses'], (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Course title is required.' });
  }
  const newCourse = db.addCourse(req.body);
  console.log(`[Courses] New course added: ${newCourse.id} - "${newCourse.title}"`);
  res.status(201).json({ success: true, message: 'Course added successfully.', course: newCourse });
});

// Update Course (Admin Full Access - supports editing any course fields)
app.patch(['/api/admin/courses/:id', '/api/courses/:id'], (req, res) => {
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  console.log(`[Courses] Course updated: ${req.params.id}`);
  res.json({ success: true, message: 'Course updated successfully.', course: updated });
});

app.put(['/api/admin/courses/:id', '/api/courses/:id'], (req, res) => {
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  console.log(`[Courses] Course updated: ${req.params.id}`);
  res.json({ success: true, message: 'Course updated successfully.', course: updated });
});

// Delete Course (Admin Full Access)
app.delete(['/api/admin/courses/:id', '/api/courses/:id'], (req, res) => {
  const deleted = db.deleteCourse(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  console.log(`[Courses] Course deleted: ${req.params.id}`);
  res.json({ success: true, message: 'Course deleted successfully.' });
});

// Submit Course Enquiry
app.post('/api/enquiries', (req, res) => {
  const { name, phone, email, course, comments, mode } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Name and Phone number are required fields.'
    });
  }

  // Basic phone validation (at least 8 digits)
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (cleanPhone.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid contact number.'
    });
  }

  const newEnquiry = db.addEnquiry({
    name: name.trim(),
    phone: cleanPhone,
    email: email ? email.trim() : '',
    course: course || 'General Enquiry',
    comments: comments ? comments.trim() : '',
    mode: mode || 'Classroom / Lab',
    ip: req.ip || req.connection.remoteAddress
  });

  console.log(`[New Enquiry Received] ${newEnquiry.id} - ${newEnquiry.name} (${newEnquiry.course})`);

  res.status(201).json({
    success: true,
    message: 'Your enquiry has been received successfully! Our Tripunithura campus advisor will contact you shortly.',
    enquiryId: newEnquiry.id,
    whatsappChatUrl: `https://wa.me/918289869975?text=${encodeURIComponent(`Hi G-TEC Tripunithura, I submitted an enquiry for ${newEnquiry.course} (Ref: ${newEnquiry.id}).`)}`
  });
});

// Submit Contact Message
app.post('/api/contact', (req, res) => {
  const { name, phone, email, course, comments } = req.body;

  if (!name || (!phone && !email)) {
    return res.status(400).json({
      success: false,
      message: 'Name and either Phone or Email must be provided.'
    });
  }

  const newContact = db.addContact({
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    email: email ? email.trim() : '',
    course: course || 'General Query',
    comments: comments ? comments.trim() : ''
  });

  res.status(201).json({
    success: true,
    message: 'Message delivered! Thank you for contacting G-TEC Tripunithura.',
    messageId: newContact.id
  });
});

// Certificate Verification Endpoint
app.get('/api/verify/:certNumber', (req, res) => {
  const certNumber = req.params.certNumber;
  const result = db.verifyCertificate(certNumber);

  if (!result) {
    return res.status(404).json({
      success: false,
      verified: false,
      message: `No certificate record found for identifier '${certNumber}'. Please verify the certificate number or contact the Tripunithura campus administration.`
    });
  }

  res.json({
    success: true,
    verified: true,
    data: result
  });
});

// Interactive Career Recommendation API
app.post('/api/quiz-recommend', (req, res) => {
  const { education, goal } = req.body;
  let rec = {
    title: 'Python Full Stack Web Development',
    duration: '6 Months',
    scholarshipCode: 'GTEC-TRP-2026',
    discount: '15% Off Early Admission',
    reason: 'Offers premier placement demand in Kochi Infopark and international IT companies.'
  };

  if (goal === 'accounting' || education === 'commerce') {
    rec = {
      title: 'DIA - Diploma in International Accounting & SAP FICO',
      duration: '6 Months',
      scholarshipCode: 'GTEC-TAX-2026',
      discount: '20% Off Tally + SAP Bundle',
      reason: 'Ideal for Commerce candidates aiming for GCC VAT, corporate accounts, and audit firms.'
    };
  } else if (goal === 'creative') {
    rec = {
      title: 'UI/UX Design Master & Motion Graphics',
      duration: '4 Months',
      scholarshipCode: 'GTEC-DESIGN-2026',
      discount: '15% Off Early Admission',
      reason: 'High-growth creative career crafting digital products, mobile apps, and branding.'
    };
  } else if (goal === 'gulf') {
    if (education === 'engineering') {
      rec = {
        title: 'Master Diploma in Architectural CADD & BIM (Revit)',
        duration: '6 Months',
        scholarshipCode: 'GTEC-BIM-GULF',
        discount: '15% Off CAD Suite',
        reason: 'Directly opens lucrative BIM engineering roles across GCC construction consultancies.'
      };
    } else {
      rec = {
        title: 'Diploma in International Accounting (GCC VAT & TallyPrime)',
        duration: '6 Months',
        scholarshipCode: 'GTEC-GULF-ACC',
        discount: '15% Off International Accounting',
        reason: 'Prepares you for the UAE & Saudi VAT accounting standards.'
      };
    }
  }

  res.json({ success: true, recommendation: rec });
});

/* ==========================================================================
   Admin API Routes (Lead Management & Authentication)
   ========================================================================== */

// Admin Authentication Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const validUsernames = ['admin', 'staff', 'gtec'];
  const validPasswords = ['admin', 'gtec2026', 'admin123'];

  if (
    username &&
    validUsernames.includes(username.trim().toLowerCase()) &&
    password &&
    validPasswords.includes(password.trim())
  ) {
    return res.json({
      success: true,
      token: 'gtec-admin-session-' + Date.now(),
      user: {
        role: 'admin',
        username: username.trim(),
        name: 'G-TEC Administrator'
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid username or password. Please try again.'
  });
});

// Get All Enquiries
app.get('/api/admin/enquiries', (req, res) => {
  const list = db.getEnquiries();
  const stats = {
    total: list.length,
    new: list.filter(e => e.status === 'New').length,
    contacted: list.filter(e => e.status === 'Contacted').length,
    enrolled: list.filter(e => e.status === 'Enrolled').length,
    closed: list.filter(e => e.status === 'Closed').length
  };

  res.json({ success: true, stats, enquiries: list });
});

// Update Enquiry Status or Notes
app.patch('/api/admin/enquiries/:id', (req, res) => {
  const { status, notes } = req.body;
  const updated = db.updateEnquiry(req.params.id, { status, notes });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Enquiry not found' });
  }
  res.json({ success: true, enquiry: updated });
});

// Delete Enquiry
app.delete('/api/admin/enquiries/:id', (req, res) => {
  const deleted = db.deleteEnquiry(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Enquiry not found' });
  }
  res.json({ success: true, message: 'Enquiry deleted' });
});

// Export Enquiries as CSV
app.get('/api/admin/export-csv', (req, res) => {
  const list = db.getEnquiries();
  const header = ['ID', 'Date', 'Name', 'Phone', 'Email', 'Course', 'Mode', 'Status', 'Notes', 'Comments'];
  const rows = list.map(e => [
    `"${e.id}"`,
    `"${new Date(e.createdAt).toLocaleString('en-IN')}"`,
    `"${(e.name || '').replace(/"/g, '""')}"`,
    `"${e.phone || ''}"`,
    `"${e.email || ''}"`,
    `"${(e.course || '').replace(/"/g, '""')}"`,
    `"${e.mode || ''}"`,
    `"${e.status || 'New'}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
    `"${(e.comments || '').replace(/"/g, '""')}"`
  ]);

  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="gtec_tripunithura_leads_${Date.now()}.csv"`);
  res.send(csv);
});

/* ==========================================================================
   Event & Examination Links API Routes (Live on Homepage Carousel Section)
   ========================================================================== */

// Get All Event / Examination Links
app.get('/api/event-links', (req, res) => {
  const links = db.getEventLinks();
  res.json({
    success: true,
    total: links.length,
    links: links
  });
});

// Add New Event / Examination Link
app.post(['/api/admin/event-links', '/api/event-links'], (req, res) => {
  const { title, url } = req.body;
  if (!title || !title.trim() || !url || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Title and target link URL are required fields.'
    });
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('/') && !formattedUrl.startsWith('#')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const newLink = db.addEventLink({
    ...req.body,
    title: title.trim(),
    url: formattedUrl
  });

  console.log(`[EventLinks] Added: ${newLink.id} - "${newLink.title}" (${newLink.url})`);
  res.status(201).json({
    success: true,
    message: 'Event / Examination link added successfully.',
    link: newLink
  });
});

// Update / Toggle Event Link
app.patch(['/api/admin/event-links/:id', '/api/event-links/:id'], (req, res) => {
  const updated = db.updateEventLink(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Link not found' });
  }
  res.json({ success: true, message: 'Link updated successfully.', link: updated });
});

// Delete Event / Examination Link
app.delete(['/api/admin/event-links/:id', '/api/event-links/:id'], (req, res) => {
  const deleted = db.deleteEventLink(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Link not found' });
  }
  console.log(`[EventLinks] Deleted link: ${req.params.id}`);
  res.json({ success: true, message: 'Link deleted successfully.' });
});

/* ==========================================================================
   Gallery & Hero Carousel API Routes
   ========================================================================== */

// Get All Gallery Items
app.get('/api/gallery', (req, res) => {
  const items = db.getGallery();
  res.json({
    success: true,
    total: items.length,
    items: items
  });
});

// Get Carousel Highlights Only
app.get('/api/gallery/highlights', (req, res) => {
  const items = db.getGallery();
  const highlights = items.filter(item => item.isHighlight === true);
  res.json({
    success: true,
    total: highlights.length,
    items: highlights
  });
});

// Add New Gallery Photo
app.post('/api/gallery', (req, res) => {
  let { title, category, date, caption, image, isHighlight } = req.body;

  if (!title || !image) {
    return res.status(400).json({
      success: false,
      message: 'Photo title and image are required.'
    });
  }

  // If image is a base64 data URL, save it to images/gallery directory
  let imagePath = image;
  if (typeof image === 'string' && image.startsWith('data:image/')) {
    try {
      const galleryDir = path.join(__dirname, 'images', 'gallery');
      if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
      }

      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        let ext = matches[1];
        if (ext === 'jpeg') ext = 'jpg';
        const base64Data = matches[2];
        const filename = `upload-${Date.now()}.${ext}`;
        const filePath = path.join(galleryDir, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        imagePath = `images/gallery/${filename}`;
      }
    } catch (saveErr) {
      console.error('Error saving uploaded photo file:', saveErr);
      // Fallback: keep image as base64 string
    }
  }

  const newItem = db.addGalleryItem({
    title: title.trim(),
    category: category ? category.trim() : 'Campus Life',
    date: date ? date.trim() : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    caption: caption ? caption.trim() : '',
    image: imagePath,
    isHighlight: isHighlight === true || isHighlight === 'true'
  });

  console.log(`[Gallery] New photo added: ${newItem.id} - "${newItem.title}" (Highlight: ${newItem.isHighlight})`);

  res.status(201).json({
    success: true,
    message: 'Photo added to gallery successfully.',
    item: newItem
  });
});

// Update Gallery Item (e.g. toggle highlight, update details)
app.patch('/api/gallery/:id', (req, res) => {
  const updated = db.updateGalleryItem(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Gallery item not found' });
  }
  res.json({ success: true, item: updated });
});

// Delete Gallery Item
app.delete('/api/gallery/:id', (req, res) => {
  const id = req.params.id;
  const items = db.getGallery();
  const target = items.find(i => i.id === id);

  const deleted = db.deleteGalleryItem(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Gallery item not found' });
  }

  // Optionally clean up uploaded photo file if it was created in images/gallery/upload-*
  if (target && target.image && target.image.includes('images/gallery/upload-')) {
    try {
      const localFilePath = path.join(__dirname, target.image);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (e) {
      console.warn('Could not remove file for deleted photo:', e.message);
    }
  }

  console.log(`[Gallery] Photo deleted: ${id}`);
  res.json({ success: true, message: 'Photo deleted successfully.' });
});

// Admin Page Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Verify Page Route
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.html'));
});

// Dedicated Gallery Page Route
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'gallery.html'));
});

// Fallback to index.html for undefined routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`G-TEC Computer Education - Tripunithura Campus Website`);
  console.log(`Server actively running on: http://localhost:${PORT}`);
  console.log(`Admin Leads Dashboard:    http://localhost:${PORT}/admin`);
  console.log(`Certificate Verification: http://localhost:${PORT}/verify`);
  console.log(`=======================================================`);
});
