# Deploy: Backend on your computer + Frontend on Vercel

This guide covers running the **backend on your computer** and deploying the **frontend to Vercel**, so the Vercel app talks to your API.

**Backend only, step by step:** see **[docs/BACKEND_DEPLOY_STEPS.md](docs/BACKEND_DEPLOY_STEPS.md)** for a numbered walkthrough (install → build → .env → run → PM2 → expose to internet).

---

## 1. Make your backend reachable from the internet

The frontend on Vercel runs in the browser and will call your backend from users’ machines. So your backend must be reachable at a **public URL**.

Options:

- **Port forwarding + static IP or dynamic DNS**  
  Forward a port (e.g. 3001) on your router to your computer and use your public IP or a hostname (e.g. No-IP, DuckDNS).  
  Backend URL will be like: `http://YOUR_PUBLIC_IP:3001` or `https://your-hostname.example.com`.

- **Tunnel (e.g. ngrok, Cloudflare Tunnel)**  
  Run a tunnel that exposes your local backend.  
  Example with ngrok: `ngrok http 3001` → you get a URL like `https://abc123.ngrok.io`. Use that as the backend URL.

Use the **backend URL** you get here as `VITE_API_URL` and `CORS_ORIGINS` below.

---

## 2. Backend on your computer

### 2.1 Install and build

```bash
cd backend
npm install
npm run build
```

### 2.2 Environment variables

Create a `.env` in `backend/` (or set env in your shell / process manager). Minimum:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the API listens on | `3001` |
| `DATABASE_PATH` | Optional. Path to SQLite file | `./data/ary.sqlite` |
| `CORS_ORIGINS` | **Required for Vercel.** Comma-separated origins that may call the API | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` or `development` | `production` |

Example `.env`:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://ary-v0.vercel.app
```

Use your **actual Vercel URL** (and add preview URLs if needed, e.g. `https://your-app.vercel.app,https://your-app-*.vercel.app` — note CORS allows exact origins; list each if you use multiple).

### 2.3 Run the backend

**One-off (foreground):**

```bash
cd backend
node dist/index.js
```

**With PM2 (keeps running after you close the terminal):**

```bash
npm install -g pm2
cd backend
pm2 start dist/index.js --name ary-api
pm2 save
pm2 startup   # optional: start on reboot
```

Backend should be listening on `http://localhost:3001` (or your `PORT`). If you use a tunnel or port forwarding, test the **public** URL (e.g. `https://abc123.ngrok.io/cases`) in a browser or with `curl`.

---

## 3. Frontend on Vercel

### 3.1 Connect the repo

1. Go to [vercel.com](https://vercel.com), sign in, and import your Git repository.
2. Set **Root Directory** to `frontend` (so Vercel builds the frontend only).
3. Build and output:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3.2 Environment variable (production API URL)

In the Vercel project: **Settings → Environment Variables**. Add:

| Name | Value | Environment |
|------|--------|--------------|
| `VITE_API_URL` | Your backend **public** URL (no trailing slash) | Production (and Preview if you want) |

Examples:

- With ngrok: `https://abc123.ngrok.io`
- With port forward: `http://YOUR_PUBLIC_IP:3001` or `https://your-hostname.example.com`

Redeploy after saving the variable so the build picks it up.

### 3.3 Deploy

Push to your connected branch or click **Redeploy** in Vercel. The frontend will be built with `VITE_API_URL` pointing at your backend. Open the Vercel app URL; it should load the UI and call your API.

---

## 4. Checklist

- [ ] Backend is reachable at a public URL (tunnel or port forward).
- [ ] Backend `.env` has `CORS_ORIGINS` set to your Vercel origin(s).
- [ ] Backend is running (e.g. `node dist/index.js` or PM2).
- [ ] Vercel project root is `frontend`, build command `npm run build`, output `dist`.
- [ ] `VITE_API_URL` is set in Vercel to your backend public URL (no trailing slash).
- [ ] Redeploy frontend after changing `VITE_API_URL`.

---

## 5. Troubleshooting

- **"Mixed Content" or "Failed to fetch" — request blocked**
  The frontend is on **HTTPS** (Vercel) but **VITE_API_URL** points to **HTTP** (e.g. `http://65.109.25.36:3001`). Browsers block HTTPS pages from calling HTTP APIs. Fix: use a backend URL that is **HTTPS**. Easiest is **ngrok** — run `ngrok http 3001` and set **VITE_API_URL** in Vercel to the **https://…ngrok-free.app** URL (no trailing slash), then redeploy. Port forwarding with a raw IP gives only HTTP unless you add TLS yourself (e.g. reverse proxy with a certificate).

- **404 on `/api/cases` or requests go to your Vercel domain**  
  The frontend is calling the API on the same origin (Vercel) instead of your backend. Fix: (1) In Vercel, set **VITE_API_URL** to your backend’s **public** URL (e.g. ngrok or `http://YOUR_IP:3001`). (2) **Redeploy** the frontend (env vars are baked in at build time). (3) Ensure the backend is running and reachable at that URL (e.g. open `YOUR_BACKEND_URL/cases` in a new tab and confirm you get JSON).

- **CORS errors in browser**  
  Ensure `CORS_ORIGINS` includes the exact origin Vercel uses (e.g. `https://your-app.vercel.app`). No trailing slash. For preview deployments, add those origins too (or list them comma-separated).

- **Frontend loads but API calls fail**  
  Check that the backend is reachable: open `VITE_API_URL/cases` in a browser or `curl VITE_API_URL/cases`. If you use a tunnel, restart it and update `VITE_API_URL` and redeploy.

- **Backend stops when you close the terminal**  
  Use a process manager (e.g. PM2) or run the backend as a service so it keeps running.
