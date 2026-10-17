# G-TEC Tripunithura — Staff Admin Portal Guide

This guide explains how to access, log in to, and manage the **Staff Administration Portal** for the G-TEC Computer Education Tripunithura Center website.

---

## 🔐 1. How to Access the Admin Portal

You can access the admin section in two ways:

### Method A: Direct URL
Depending on how your website is hosted or running:
- **Node.js Local Server (Recommended):**  
  👉 [http://localhost:8080/admin](http://localhost:8080/admin) or [http://localhost:8080/admin.html](http://localhost:8080/admin.html)
- **VS Code Live Server:**  
  👉 `http://127.0.0.1:5501/admin.html`
- **Live Production Domain:**  
  👉 `https://your-domain.com/admin` or `https://your-domain.com/admin.html`

### Method B: Via the Website Footer (Discreet Staff Link)
1. Open any page on the public website (`index.html`, `gallery.html`, `courses.html`, `about.html`, `placement.html`, `affiliation.html`, or `contact.html`).
2. Scroll down to the bottom copyright bar.
3. Click the discreet **🔒 Staff Portal** link located next to the copyright line.

---

## 🔑 2. Admin Security & Credential Customization

The Admin Portal is protected by an authentication barrier to prevent unauthorized visitors from viewing student inquiries or altering website photos.

- **Initial Access:** The administrator can sign in using the center's configured credentials.
- **Customizable Credentials (Change Username & Password):** Administrators can now change their username, password, or both directly inside the Admin Portal at any time via the **"Change Credentials"** header button or the **Security & Credentials** tab.
- **Hidden Credentials & Privacy:** Credential hints and plaintext passwords are completely hidden from the public website, dashboard views, and client scripts.
- **PBKDF2 SHA-512 Encryption:** All updated passwords are cryptographic hashes; no plaintext passwords are saved.
- **Dual Verification:** Validates against the secure Node.js backend (`/api/admin/login` and `/api/admin/change-credentials`) with resilient offline fallback for local testing.
- **Zero Data Loss:** Updating administrative credentials has 0 impact on courses, student leads, gallery photos, examination links, or certificate verification records.

---

## 📋 3. Admin Features & Capabilities (Full Admin Access)

The admin portal features five dedicated management tabs:

### Tab 1: Admissions & Leads Management (`#leadsSection`)
- **Real-Time Counters:** View instant counts for *Total Enquiries*, *New Leads*, *In Contact*, and *Enrolled Students*.
- **Search & Filter:** Find any lead by student name, WhatsApp mobile number, or enrolled course.
- **Lifecycle Status Dropdown:** Update student lead stages directly (`New` ➔ `Contacted` ➔ `Enrolled` ➔ `Closed`).
- **1-Click Counsellor Actions:**
  - 💬 **WhatsApp Button:** Launches a direct WhatsApp chat with a pre-filled greeting message regarding their course of interest.
  - 📞 **Phone Button:** Quick-dials the student's mobile number.
  - 🗑️ **Delete Button:** Removes the lead with confirmation.
- **Export to CSV:** Click the top-bar button `[Export Leads CSV]` to download all student inquiries for Excel or CRM import.

---

### Tab 2: Events & Examination Links Manager (`#eventLinksSection`)
Control live portal links appearing in the dedicated section right above the homepage carousel:

#### Secure Admin-Only Event Management (`admin.html#eventLinksSection`)
- **Exclusive Administrative Control:** Event and examination links can now be added and managed exclusively via the protected Admin Portal (`admin.html`). Public visitors on the main website cannot upload links, keeping the site secure and spam-free.
- **Admin Privacy:** No administrative credential hints, passcodes, or modal inputs are exposed anywhere on the public website.
- **Real-Time Counters:** Total Portal Links, Active Examinations, Active Events, and Live on Homepage.
- **Paste & Publish Any Event / Examination Link:**
  - Enter **Event / Exam Title** (e.g. *G-TEC National Level Scholarship Examination 2026*).
  - Paste **Target Link URL** (e.g. *https://gteceducation.com* or any custom portal web address).
  - Select **Category / Type** (*Examination*, *Campus Event*, *Admit Card / Hall Ticket*, *Webinar & Workshop*, *Placement Drive*, *Official Notice*).
  - Set **Badge Status / Date Text** (e.g. *Registrations Open*, *Exam Date: 25 May*).
  - Optional **Candidate Instructions / Description**.
  - Check **"Show in live section above Carousel on Homepage"** to immediately display it for students.
- **1-Click Live Status Toggle:** Pause or activate links without deleting them.
- **1-Click Delete:** Click the trash icon (`🗑️`) to remove any link from the website with confirmation.

---

### Tab 3: Courses Full Access Management (`#coursesSection`)
Complete control over the website's course catalogue and academic syllabus:

- **Real-Time Counters:** Total Programs, Software & IT, Accounting & Finance, and CADD & Multimedia.
- **Add New Course Program:**
  - Fill in Title, unique ID/slug, category, duration, mode, eligibility, rating, short description, detailed description, tools list, syllabus modules, career paths, and certifications.
- **Dynamic Custom Course Fields Builder ("Add Another Course Field"):**
  - Click `[+ Add Another Course Field]` to dynamically attach custom information:
    - *Course Fee* (e.g. *₹25,000 / Flexible EMI*)
    - *Batch Timing* (e.g. *Morning 9:30 AM - 1:30 PM*)
    - *Prerequisites* (e.g. *Basic Computer Knowledge*)
    - *Brochure PDF Link*, *Seats Available*, etc.
  - All custom fields automatically render inside the course cards and detailed syllabus modals!
- **Edit Existing Courses:** Click the edit icon (`✏️`) to update any information, modify syllabus modules, or add/delete custom fields.
- **Delete Course:** Click the trash icon (`🗑️`) to remove any course from the website.
- **Zero Data Loss Guarantee:** All existing default course data is preserved in `data/courses.json` and `js/courses-data.js`.

---

### Tab 4: Gallery & Carousel Manager (`#gallerySection`)
All photo additions and deletions are completely isolated here so visitors on the public gallery tab cannot modify images.

- **Real-Time Photo Counters:**
  - *Total Photos*
  - *Hero Carousel Slides* (Active in the Home Netflix-style carousel)
  - *Event Categories*
  - *Gallery Tab Only*
- **Quick Links Banner:** Direct shortcut to manage event/exam links displayed above the carousel.
- **Add New Photograph:**
  1. Fill in **Event Title** (e.g., *Python Full Stack Hackathon 2026*).
  2. Select **Event Category** (*Workshops & Tech*, *Placements*, *Campus Life*, *Convocations*, *Awards & Milestones*).
  3. Enter **Date / Month** (e.g., *April 2026*).
  4. Enter a **Brief Caption**.
  5. Choose photo source:
     - **Device Upload:** Click the dashed upload area to select a JPG/PNG/WEBP image from your computer (auto-converts to optimized preview).
     - **Image URL / Relative Path:** Enter a link (e.g., `images/gallery/tech-hackathon.jpg` or an external URL).
  6. Check **"Show in Hero Carousel Highlights on Home Page"** if you want the photo to be included in the auto-playing home carousel.
  7. Click **"Save & Publish Photo"** — updates immediately without touching any code!
- **Manage Existing Photos:**
  - **1-Click Feature Toggle:** Click `[Feature in Carousel]` or `[Remove from Carousel]` to instantly control which photos appear on the homepage.
  - **1-Click Delete:** Click the trash icon (`🗑️`) to remove any photo from both the gallery and the homepage carousel.

---

### Tab 5: Security & Credential Management (`#securitySection`)
Comprehensive account protection and credential customization:

- **Active Username Display:** Verify the currently active administrative ID.
- **Change Username:** Specify any new custom username (letters, numbers, underscores, min. 3 characters).
- **Change Password:** Specify a new password (min. 6 characters) with real-time match confirmation and toggleable visibility.
- **Current Password Verification:** Requires verifying current password before applying changes to protect against unauthorized modification.
- **Hidden Credentials & Hints:** No passwords, hints, or passcodes are exposed on public pages or on dashboard counters.
- **Persistent Storage:** Stored securely in `data/admin_credentials.json` (and synchronized with Supabase if connected).

---

## 🚪 4. Signing Out & Locking the Portal

- To exit and lock the portal, click the red **Sign Out** button located in the top-right corner of the Admin header.
- Your session is immediately cleared, ensuring no unauthorized visitor on that computer can access student data or modify photos.

---

## 🛠️ 5. Starting the Server Locally

To run the full-stack server locally:

```bash
# In the project directory:
npm install
node server.js
```

The terminal will confirm:
```
=======================================================
G-TEC Computer Education - Tripunithura Campus Website
Server actively running on: http://localhost:8080
Admin Leads Dashboard:    http://localhost:8080/admin
Certificate Verification: http://localhost:8080/verify
=======================================================
```
