/**
 * G-TEC Computer Education - Tripunithura Campus
 * Production Express Backend Server
 */
require('dotenv').config();
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
    if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

/* ==========================================================================
   Public API Routes
   ========================================================================== */

// System Health Check (Reports Database Mode)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    center: 'G-TEC Tripunithura Campus (Kochi)',
    database: db.isSupabaseConnected() ? 'supabase_cloud' : 'local_json_backup',
    supabaseConnected: db.isSupabaseConnected(),
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Get Courses with optional filtering
app.get('/api/courses', async (req, res) => {
  try {
    const { category, search } = req.query;
    let results = await db.getCourses();

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
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// Get Single Course Details
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving course' });
  }
});

// Add New Course (Admin Full Access)
app.post(['/api/admin/courses', '/api/courses'], async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Course title is required.' });
    }
    const newCourse = await db.addCourse(req.body);
    console.log(`[Courses] New course added: ${newCourse.id} - "${newCourse.title}"`);
    res.status(201).json({ success: true, message: 'Course added successfully.', course: newCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add course' });
  }
});

// Update Course (Admin Full Access - supports editing any course fields)
app.patch(['/api/admin/courses/:id', '/api/courses/:id'], async (req, res) => {
  try {
    const updated = await db.updateCourse(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    console.log(`[Courses] Course updated: ${req.params.id}`);
    res.json({ success: true, message: 'Course updated successfully.', course: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

app.put(['/api/admin/courses/:id', '/api/courses/:id'], async (req, res) => {
  try {
    const updated = await db.updateCourse(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    console.log(`[Courses] Course updated: ${req.params.id}`);
    res.json({ success: true, message: 'Course updated successfully.', course: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

// Delete Course (Admin Full Access)
app.delete(['/api/admin/courses/:id', '/api/courses/:id'], async (req, res) => {
  try {
    const deleted = await db.deleteCourse(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    console.log(`[Courses] Course deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

// Submit Course Enquiry
app.post('/api/enquiries', async (req, res) => {
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

  const newEnquiry = await db.addEnquiry({
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
app.post('/api/contact', async (req, res) => {
  const { name, phone, email, course, comments } = req.body;

  if (!name || (!phone && !email)) {
    return res.status(400).json({
      success: false,
      message: 'Name and either Phone or Email must be provided.'
    });
  }

  const newContact = await db.addContact({
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
app.get('/api/verify/:certNumber', async (req, res) => {
  const certNumber = req.params.certNumber;
  const result = await db.verifyCertificate(certNumber);

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
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const authResult = await db.verifyAdminLogin(username, password);
    if (authResult && authResult.valid) {
      return res.json({
        success: true,
        token: 'gtec-admin-session-' + Date.now(),
        user: authResult.user
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid username or password. Please try again.'
    });
  } catch (err) {
    console.error('[Admin] Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
});

// Admin Status / Profile (Secured: reveals zero passwords or hints)
app.get('/api/admin/credentials/status', async (req, res) => {
  try {
    const profile = await db.getAdminProfile();
    res.json({
      success: true,
      profile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch admin security status.' });
  }
});

// Admin Change Credentials (Change Username and/or Change Password)
app.post('/api/admin/change-credentials', async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required to verify your identity.'
      });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a new username or a new password.'
      });
    }

    if (newPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation password do not match.'
      });
    }

    const result = await db.updateAdminCredentials({
      currentPassword,
      newUsername,
      newPassword
    });

    res.json(result);
  } catch (err) {
    console.warn('[Admin] Change credentials error:', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update admin credentials.'
    });
  }
});

// Get All Enquiries
app.get('/api/admin/enquiries', async (req, res) => {
  try {
    const list = await db.getEnquiries();
    const stats = {
      total: list.length,
      new: list.filter(e => e.status === 'New').length,
      contacted: list.filter(e => e.status === 'Contacted').length,
      enrolled: list.filter(e => e.status === 'Enrolled').length,
      closed: list.filter(e => e.status === 'Closed').length
    };

    res.json({ success: true, stats, enquiries: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries' });
  }
});

// Update Enquiry Status or Notes
app.patch('/api/admin/enquiries/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await db.updateEnquiry(req.params.id, { status, notes });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, enquiry: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update enquiry' });
  }
});

// Delete Enquiry
app.delete('/api/admin/enquiries/:id', async (req, res) => {
  try {
    const deleted = await db.deleteEnquiry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete enquiry' });
  }
});

// Export Enquiries as CSV
app.get('/api/admin/export-csv', async (req, res) => {
  try {
    const list = await db.getEnquiries();
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
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
});

/* ==========================================================================
   Event & Examination Links API Routes (Live on Homepage Carousel Section)
   ========================================================================== */

// Get All Event / Examination Links
app.get('/api/event-links', async (req, res) => {
  try {
    const links = await db.getEventLinks();
    res.json({
      success: true,
      total: links.length,
      links: links
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve event links' });
  }
});

// Add New Event / Examination Link
app.post(['/api/admin/event-links', '/api/event-links'], async (req, res) => {
  try {
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

    const newLink = await db.addEventLink({
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
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add event link' });
  }
});

// Update / Toggle Event Link
app.patch(['/api/admin/event-links/:id', '/api/event-links/:id'], async (req, res) => {
  try {
    const updated = await db.updateEventLink(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    res.json({ success: true, message: 'Link updated successfully.', link: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update event link' });
  }
});

// Delete Event / Examination Link
app.delete(['/api/admin/event-links/:id', '/api/event-links/:id'], async (req, res) => {
  try {
    const deleted = await db.deleteEventLink(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    console.log(`[EventLinks] Deleted link: ${req.params.id}`);
    res.json({ success: true, message: 'Link deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete event link' });
  }
});

/* ==========================================================================
   Gallery & Hero Carousel API Routes
   ========================================================================== */

// Get All Gallery Items
app.get('/api/gallery', async (req, res) => {
  try {
    const items = await db.getGallery();
    res.json({
      success: true,
      total: items.length,
      items: items
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve gallery items' });
  }
});

// Get Carousel Highlights Only
app.get('/api/gallery/highlights', async (req, res) => {
  try {
    const items = await db.getGallery();
    const highlights = items.filter(item => item.isHighlight === true);
    res.json({
      success: true,
      total: highlights.length,
      items: highlights
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve highlights' });
  }
});

// Add New Gallery Photo
app.post('/api/gallery', async (req, res) => {
  try {
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
      }
    }

    const newItem = await db.addGalleryItem({
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
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add gallery item' });
  }
});

// Update Gallery Item (e.g. toggle highlight, update details)
app.patch('/api/gallery/:id', async (req, res) => {
  try {
    const updated = await db.updateGalleryItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update gallery item' });
  }
});

// Delete Gallery Item
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const items = await db.getGallery();
    const target = items.find(i => i.id === id);

    const deleted = await db.deleteGalleryItem(id);
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
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete gallery item' });
  }
});

/* ==========================================================================
   SEO & Public Page Clean Routes
   ========================================================================== */

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').sendFile(path.join(__dirname, 'robots.txt'));
});

// XML Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Public Clean Routes
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/courses', (req, res) => {
  res.sendFile(path.join(__dirname, 'courses.html'));
});

app.get('/placement', (req, res) => {
  res.sendFile(path.join(__dirname, 'placement.html'));
});

app.get('/affiliation', (req, res) => {
  res.sendFile(path.join(__dirname, 'affiliation.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Verify Page Route
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.html'));
});

// Admin Page Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
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
