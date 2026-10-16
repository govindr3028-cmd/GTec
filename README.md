# G-TEC Computer Education - Tripunithura Campus Website

A complete, production-ready full-stack website for **G-TEC Computer Education, Tripunithura Campus (Kochi, Kerala)**.

---

## 🌟 Highlights & Features

1. **Pages Included:**
   - `index.html`: Flagship homepage with hero banner, live statistics counter, why choose us, course highlights, interactive career advisor quiz, placements showcase, recruiter marquee, Google review testimonials, FAQ accordion, contact form, and campus location map.
   - `courses.html`: Complete catalog of 18+ industry diploma courses with live search and category filter.
   - `about.html`: G-TEC's 25+ years educational legacy, Tripunithura campus infrastructure (high-end labs, licensed tools, AV classrooms), and leadership.
   - `placement.html`: Dedicated career cell, 4-step placement acceleration framework, 10,000+ placements record, recruiter network, and placed alumni profiles.
   - `affiliation.html`: Global affiliations (NSDC, Microsoft, Autodesk, Adobe, Tally Education, SAP, Cambridge English, ISO 9001:2015), awards, and recognition.
   - `contact.html`: Statue Junction address, transit guide (Metro, Bus Stand, Railway Station), contact form, and Google Maps embed.
   - `verify.html`: Online certificate verification portal where students and employers authenticate diploma credentials.
   - `admin.html`: Admissions & leads admin dashboard with live enquiry stats, status management, 1-click WhatsApp/Call actions, and CSV export.

2. **Backend Architecture:**
   - **Node.js / Express Server (`server.js`)**: Production-ready REST APIs.
   - **Persistent Storage (`db.js` & `data/`)**: Atomic, crash-resilient JSON storage for enquiries, contact messages, and certificate verification records.
   - **Alternative PHP APIs (`api/`)**: `enquiry.php` and `contact.php` for standard cPanel / LAMP hosting environments.

3. **Rest API Endpoints:**
   - `GET /api/health` - Server health and uptime
   - `GET /api/courses` - Course catalog with `?category=` and `?search=` filters
   - `GET /api/courses/:id` - Detailed course syllabus & tools
   - `POST /api/enquiries` - Submit admissions enquiry (stores lead in database, returns reference ID)
   - `POST /api/contact` - Submit contact message
   - `GET /api/verify/:certNumber` - Certificate verification
   - `POST /api/quiz-recommend` - Career advisor recommendation
   - `GET /api/admin/enquiries` - All student leads with status breakdown
   - `PATCH /api/admin/enquiries/:id` - Update lead status (New, Contacted, Enrolled, Closed)
   - `GET /api/admin/export-csv` - Download leads in CSV format

---

## 🚀 How to Run Locally

### Option 1: Node.js (Full-Stack Mode - Recommended)
1. Ensure Node.js (v18+) is installed.
2. In the project directory, run:
   ```bash
   npm install
   npm start
   ```
3. Open your browser:
   - **Website:** [http://localhost:8080/](http://localhost:8080/)
   - **Admin Leads Portal:** [http://localhost:8080/admin](http://localhost:8080/admin)
   - **Certificate Verification:** [http://localhost:8080/verify](http://localhost:8080/verify)

### Option 2: Static / PHP Hosting (cPanel / Apache / XAMPP)
- Upload all files to your `public_html` or web server root directory.
- The site works seamlessly with static files and includes PHP endpoints in `api/enquiry.php` and `api/contact.php`.

---

## 🔐 Staff Admin Portal Access

The administration portal is separated from the public gallery and website so that visitors cannot alter data. It is secured behind a staff authentication barrier.

- **Direct URL:** [http://localhost:8080/admin](http://localhost:8080/admin) (or `admin.html`)
- **Footer Link:** Click the **🔒 Staff Portal** link in the footer bottom bar of any page.
- **Default Login Credentials:**
  - **Username:** `admin` *(or `staff`, `gtec`)*
  - **Password:** `gtec2026` *(or `admin`, `admin123`)*
- **Admin Capabilities:**
  - **Admissions & Leads:** Filter, search, call, direct WhatsApp chat, update status, and export to CSV.
  - **Gallery & Carousel Manager:** Add new event photos (file upload or URL), preview, toggle Home Carousel highlights, and 1-click delete photos without code edits.

👉 **For the comprehensive admin documentation, refer to [ADMIN_README.md](ADMIN_README.md).**

---

## 📞 Tripunithura Campus Contact Information
- **Address:** Statue Junction, Near Municipal Complex, Layam Road / Hill Palace Road, Tripunithura, Kochi, Ernakulam, Kerala - 682301
- **Phone:** +91 82898 69975
- **WhatsApp:** +91 82898 69975
- **Email:** tripunithura.ekm@gteceducation.com
