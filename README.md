# HRAD Task Monitor

Internal task management dashboard for the Human Resource & Admin Department.

---

## Project structure

```
hrad-app/
├── public/
│   └── index.html          ← The entire app (single file)
├── google-apps-script.js   ← Paste into Google Apps Script
├── vercel.json             ← Vercel routing config
└── README.md
```

---

## Setup guide

### Step 1 — Set up Google Sheet + Apps Script

1. Go to https://sheets.google.com → create a new spreadsheet → name it **HRAD Task Monitor**
2. Click **Extensions → Apps Script**
3. Delete all default code, paste the contents of `google-apps-script.js`
4. Click **Save** (name the project: HRAD API)
5. In the function dropdown at the top, select **setupSheet** → click **Run**
   - This creates your headers and formats the sheet automatically
6. Click **Deploy → New Deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy** and copy the **Web App URL** — you'll need it later

---

### Step 2 — Set up Google OAuth (for login)

1. Go to https://console.cloud.google.com
2. Create a new project (name it: HRAD App)
3. Go to **APIs & Services → OAuth consent screen**
   - User type: **Internal** (restricts to your Google Workspace org only)
   - Fill in app name: HRAD Task Monitor
   - Save and continue through the steps
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: HRAD Web App
   - Authorized JavaScript origins: add your Vercel URL (e.g. `https://hrad-app.vercel.app`)
     - Also add `http://localhost:3000` for local testing
   - Authorized redirect URIs: same URLs as above
5. Click **Create** and copy the **Client ID** (looks like: `xxxx.apps.googleusercontent.com`)

---

### Step 3 — Configure the app

Open `public/index.html` and find these two lines near the top of the `<script>` section:

```javascript
const ALLOWED_DOMAIN = 'yourdomain.com';       // ← change to your org domain, e.g. 'acme.com'
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // ← paste your Client ID
```

Change both values and save.

---

### Step 4 — Deploy to Vercel

**Option A — Drag & drop (easiest):**
1. Go to https://vercel.com → sign up / log in
2. Click **Add New → Project**
3. Drag the entire `hrad-app` folder onto the Vercel upload area
4. Click **Deploy**
5. Vercel gives you a URL like `https://hrad-app.vercel.app`

**Option B — GitHub (recommended for updates):**
1. Push this folder to a GitHub repository
2. Go to https://vercel.com → Import from GitHub
3. Select the repo → Deploy
4. Future updates: just push to GitHub → Vercel auto-redeploys

---

### Step 5 — Final wiring

1. Go back to Google Cloud Console → your OAuth credentials
2. Add your live Vercel URL to **Authorized JavaScript origins** and **Authorized redirect URIs**
3. Open your live app URL → paste the Apps Script Web App URL into the connection bar → click Connect

---

## Using the app

- **Login**: Team members sign in with their Google account (restricted to your org domain)
- **Dashboard**: Real-time metrics, charts, and overdue task highlights
- **Tasks page**: Full table with search, filter by status/priority/department
- **Add task**: Click "New task" → fill form → saves instantly to Google Sheet
- **Edit task**: Click the pencil icon on any row
- **Delete task**: Click the trash icon on any row
- **Refresh**: Click the Refresh button on the dashboard to pull latest data

---

## Sharing with your team

Once deployed on Vercel:
- Share the Vercel URL (e.g. `https://hrad-app.vercel.app`) with your team
- Anyone with a `@yourdomain.com` Google account can log in
- All changes sync to the shared Google Sheet in real time

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Cannot reach sheet" | Re-deploy the Apps Script; make sure access is set to "Anyone" |
| "Access denied" on login | Check that ALLOWED_DOMAIN matches your Google Workspace domain exactly |
| Login redirect doesn't work | Add your Vercel URL to Google OAuth authorized origins |
| Tasks not showing after save | Check Apps Script headers — run setupSheet() again if needed |
