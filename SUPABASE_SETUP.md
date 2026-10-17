# G-TEC Computer Education - Supabase Database Setup & Migration Guide

The database layer has been upgraded to **Supabase Cloud PostgreSQL** while maintaining a **zero data loss guarantee** and an automatic local hot-backup.

---

## 🚀 Quick Setup (3 Simple Steps)

### Step 1: Run the Database Schema in Supabase
1. Open your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab (left sidebar).
3. Copy the entire contents of [`supabase_schema.sql`](file:///Users/govind/GTec%20/supabase_schema.sql) and paste it into the SQL editor.
4. Click **Run**. This will create the following PostgreSQL tables with indexes and Row Level Security (RLS) policies:
   - `courses`
   - `enquiries`
   - `event_links`
   - `gallery`
   - `certificates`
   - `contacts`

---

### Step 2: Add Your Credentials to `.env`
1. In your Supabase Dashboard, go to **Project Settings ➔ API**.
2. Copy your **Project URL** and **API Keys** (`anon` public key or `service_role` secret key).
3. Open the [`.env`](file:///Users/govind/GTec%20/.env) file in the project root and add them:

```env
PORT=8080
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

---

### Step 3: Sync & Migrate All Existing Data
Run the automated migration script in your terminal:

```bash
npm run migrate
```

This will automatically read all existing data from your local files and seed them into Supabase:
- ✅ **18 Courses** (Full details, tools, syllabus, careers, certifications, custom fields)
- ✅ **7 Gallery Highlights**
- ✅ **3 Verification Certificates**
- ✅ **All Enquiries, Contacts & Event Links**

---

## 🛡️ Zero Data Loss Guarantee & Offline Resilience
- **Hybrid Mirror Storage**: When connected to Supabase, any additions or updates automatically write to Supabase PostgreSQL **and** update the local JSON files in `data/` as a live mirror.
- **Fail-Safe Fallback**: If internet connectivity is interrupted or Supabase is temporarily unreachable, the app seamlessly reads from and writes to the local JSON database without crashing.
- **Status Check**: Visit `http://localhost:8080/api/health` anytime to see the active database status (`database: "supabase_cloud"` or `"local_json_backup"`).
