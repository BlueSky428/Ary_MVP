# Backend deploy — step by step

Follow these steps in order to run the Ary backend on your computer so it can serve the frontend (e.g. on Vercel).

---

## Step 1: Open a terminal in the project

- Open terminal (PowerShell or Command Prompt).
- Go to the project root:
  ```bash
  cd D:\Tom\Project\Ary_MVP
  ```

---

## Step 2: Install backend dependencies and build

Run:

```bash
cd backend
npm install
npm run build
```

- You should see no errors; at the end there is a `backend/dist` folder with compiled JavaScript.
- If `npm run build` fails, fix the errors (e.g. TypeScript) before continuing.

---

## Step 3: Create the backend `.env` file

1. In the `backend` folder, create a file named `.env` (same folder as `package.json`).
2. Add these lines (change the values if needed):

```env
PORT=3001
NODE_ENV=production
DATABASE_PATH=./data/ary.sqlite
```

3. If your frontend will run on another host (e.g. Vercel), add the frontend URL so the browser is allowed to call the API:

```env
CORS_ORIGINS=https://your-app.vercel.app
```

- Replace `https://your-app.vercel.app` with your **real** frontend URL (no trailing slash).
- If you have several origins (e.g. main + preview), separate them with commas:  
  `CORS_ORIGINS=https://app.vercel.app,https://app-preview.vercel.app`
- If you only test locally (frontend and backend on the same machine), you can omit `CORS_ORIGINS` for now.

Save the file.

---

## Step 4: Run the backend (first time)

1. In the terminal (still in `backend`):

```bash
node dist/index.js
```

2. You should see something like: `Ary V0 API listening on http://localhost:3001`
3. In the browser open: `http://localhost:3001/cases`  
   - You should get JSON (e.g. `[]` if there are no cases). That means the backend is running.
4. Stop the server with `Ctrl+C` when you are done testing.

---

## Step 5: (Optional) Keep the backend running with PM2

If you want the backend to keep running after you close the terminal and after reboot:

1. Install PM2 once (global):

```bash
npm install -g pm2
```

2. From the **project root** (so paths are correct):

```bash
cd D:\Tom\Project\Ary_MVP\backend
pm2 start dist/index.js --name ary-api
```

3. Check it’s running:

```bash
pm2 status
```

4. (Optional) Save the process list and enable start on reboot:

```bash
pm2 save
pm2 startup
```

- Use the command that `pm2 startup` prints if it asks you to run something.

To stop later: `pm2 stop ary-api`  
To view logs: `pm2 logs ary-api`

---

## Step 6: Make the backend reachable from the internet (if frontend is on Vercel)

The frontend on Vercel runs in the user’s browser. The browser must be able to call your backend using a **public URL**. Two common options:

**Important — Mixed content:** Your Vercel site is HTTPS. Browsers block HTTPS pages from loading HTTP resources. So `VITE_API_URL` must be an **HTTPS** URL. Option A (ngrok) gives HTTPS; Option B (port forward) gives `http://...`, which will be blocked when the frontend is on Vercel. For Vercel, **use ngrok** so the backend URL is `https://....ngrok-free.app`.

---

### Option A: ngrok (tunnel) — recommended to start

ngrok creates a secure tunnel from the internet to your PC. No router or firewall changes needed. Good for testing and small use.

#### A.1 Sign up and install

1. Create a free account: https://ngrok.com  
2. Download ngrok: https://ngrok.com/download  
   - On Windows: download the ZIP, unzip it, and put `ngrok.exe` in a folder that’s in your PATH (e.g. `C:\Users\YourName\bin`) or remember the folder.
3. Get your auth token: in the ngrok dashboard go to **Your Authtoken** and copy it.
4. In a terminal, run (use the path where you put `ngrok.exe` if needed):
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```
   Replace `YOUR_TOKEN_HERE` with the token. You only do this once.

#### A.2 Start your backend

- Make sure the backend is running (Step 4 or 5), e.g. `node dist/index.js` or `pm2` with `ary-api` running.
- It must be listening on the same port you will give to ngrok (default 3001).

#### A.3 Start the tunnel

1. Open a **new** terminal (leave the one running the backend open).
2. Run:
   ```bash
   ngrok http 3001
   ```
   If your backend uses another port, use that number instead of `3001`.
3. ngrok will show a screen with:
   - **Forwarding** — a line like `https://abc123.ngrok-free.app -> http://localhost:3001`
   - That **HTTPS** URL is your **backend public URL**.

#### A.4 Use the public URL

- Copy the `https://....ngrok-free.app` URL (no path, no trailing slash).
- **In Vercel:** set the env variable `VITE_API_URL` to this URL so the frontend calls it.
- **In backend `.env`:** your frontend (e.g. Vercel) runs on a different origin, so you already set `CORS_ORIGINS` to your Vercel URL in Step 3. No need to add the ngrok URL to CORS (browser sends requests from the Vercel origin to the ngrok URL).

#### A.5 Important notes about ngrok

- **URL changes:** On the free plan, the ngrok URL changes every time you stop and start ngrok. After each change you must:
  1. Update `VITE_API_URL` in Vercel to the new URL.
  2. Redeploy the frontend (or at least trigger a new build).
- **Keep the tunnel running:** As long as the ngrok terminal is open and running, the tunnel works. If you close it, the URL stops working until you run `ngrok http 3001` again (and then you get a new URL on free tier).
- **Fixed domain (paid):** Paid ngrok plans let you reserve a fixed subdomain so the URL doesn’t change.
- **Windows Firewall:** Usually you don’t need to allow anything; ngrok makes outbound connections.

---

### Option B: Port forwarding on your router

Your backend stays on your PC. The router forwards traffic from the internet (your public IP + port) to your PC’s local IP and port. No third-party tunnel.

#### B.1 Find your PC’s local IP address

- **Windows:** Open PowerShell or Command Prompt and run:
  ```bash
  ipconfig
  ```
  Look for **IPv4 Address** under the adapter you use for the internet (often “Ethernet” or “Wi-Fi”). It looks like `192.168.1.105`. Note it down — this is your **local IP**.

#### B.2 Find your router’s admin page and public IP

- **Router admin:** Often `http://192.168.1.1` or `http://192.168.0.1`. Check the sticker on the router or your ISP’s instructions. Log in.
- **Public IP:** In a browser, search for “what is my ip” or open https://whatismyip.com. Note the IP (e.g. `203.0.113.45`). This is the **public IP** that the internet uses to reach your router.

#### B.3 Create a port forwarding rule

1. In the router admin, find a section named **Port Forwarding**, **Virtual Server**, **NAT**, or **Applications**.
2. Add a new rule:
   - **External port (or “Public port”):** `3001` (or another port if 3001 is already used).
   - **Internal IP:** your PC’s **local IP** from B.1 (e.g. `192.168.1.105`).
   - **Internal port (or “Private port”):** `3001` (same as the port your backend listens on).
   - **Protocol:** TCP (or “Both” if only TCP/UDP are options).
3. Save and apply. The router will now send incoming traffic to `YOUR_PUBLIC_IP:3001` to your PC at `YOUR_LOCAL_IP:3001`.

#### B.4 Allow the port in Windows Firewall

- Windows may block incoming connections on port 3001. Allow it:
  1. Search **Windows Security** → **Firewall & network protection** → **Advanced settings** (or run `wf.msc`).
  2. **Inbound Rules** → **New Rule** → **Port** → Next.
  3. TCP, Specific local ports: `3001` → Next.
  4. Allow the connection → Next.
  5. Apply to Domain, Private, Public (or at least the profile you use) → Next.
  6. Name it e.g. “Ary backend” → Finish.

#### B.5 Your backend public URL

- If you used port 3001: **`http://YOUR_PUBLIC_IP:3001`**  
  Example: `http://203.0.113.45:3001`
- **If your frontend is on Vercel (HTTPS):** This URL is HTTP, so the browser will block API requests (mixed content). Use **Option A (ngrok)** instead so you get an HTTPS backend URL.
- If your frontend is also HTTP (e.g. local only), you can use this URL as `VITE_API_URL`.
- `CORS_ORIGINS` in backend `.env` should already be your Vercel URL (Step 3).

#### B.6 If your public IP changes (dynamic IP)

- Many home connections get a new public IP when the router restarts. Then your URL stops working until you update Vercel with the new IP.
- **Dynamic DNS** gives you a fixed hostname that always points to your current public IP:
  1. Sign up with a provider (e.g. No-IP, DuckDNS, Dynu).
  2. Install their small updater on your PC (or enable one in the router if it supports it).
  3. Use the hostname they give you (e.g. `yourname.ddns.net`) instead of the IP.  
  Your backend URL becomes: **`http://yourname.ddns.net:3001`**  
  Set that as `VITE_API_URL` in Vercel; you usually don’t need to change it again when the IP changes.

#### B.7 Security note

- With port forwarding, your backend is directly reachable from the internet. Keep the machine and Node.js updated. For stronger security you can put the backend behind a reverse proxy with HTTPS (e.g. Caddy, nginx) or use a tunnel (Option A) instead.

---

### Which option to use

| Situation | Prefer |
|-----------|--------|
| Quick test, demo, or low traffic | **Option A (ngrok)** — no router/firewall setup; accept that the free URL changes when you restart ngrok. |
| Stable URL on your own connection | **Option B (port forward)** — optionally with dynamic DNS so the hostname stays the same. |
| Don’t want to open your router | **Option A (ngrok)**. |

---

## Step 7: Test the backend from the internet

- If using **ngrok**: open in a browser: `https://YOUR_NGROK_URL/cases`  
  (e.g. `https://abc123.ngrok-free.app/cases`)
- If using **port forwarding**: open: `http://YOUR_PUBLIC_IP:3001/cases`

You should see the same JSON response as with `http://localhost:3001/cases`. If that works, the backend is deployed and reachable.

---

## Quick reference

| Step | What you do |
|------|------------------|
| 1 | Open terminal, `cd` to project |
| 2 | `cd backend` → `npm install` → `npm run build` |
| 3 | Create `backend/.env` with `PORT`, `NODE_ENV`, `DATABASE_PATH`, and `CORS_ORIGINS` (if frontend on another host) |
| 4 | Run: `node dist/index.js` and test `http://localhost:3001/cases` |
| 5 | (Optional) Use PM2 to keep it running |
| 6 | Expose backend (ngrok or port forward) and note the public URL |
| 7 | Test public URL in browser (e.g. `.../cases`) |

For frontend on Vercel, set **VITE_API_URL** in Vercel to the public URL from Step 6, and ensure that same origin (or your Vercel domain) is in **CORS_ORIGINS** in `backend/.env`.  
Full deploy (backend + Vercel) is in **[DEPLOY.md](../DEPLOY.md)**.
