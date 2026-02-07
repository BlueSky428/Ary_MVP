# Fixed Cloudflare Tunnel URL (set VITE_API_URL once)

With a **named tunnel** and a hostname in Cloudflare, your tunnel URL stays the same every time you start it. You set **VITE_API_URL** in Vercel once and never change it.

## What you need

- A **Cloudflare account** (free)
- A **domain** (or subdomain) that you can manage in Cloudflare — e.g. `api.yourdomain.com` or a free subdomain you add to Cloudflare

## One-time setup

### 1. Create the tunnel and get credentials

In PowerShell or Command Prompt:

```bash
cloudflared tunnel create ary-backend
```

If `cloudflared` is not in PATH, use the full path:

```bash
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel create ary-backend
```

- Note the **Tunnel ID** (a UUID) that is printed.
- Credentials are saved to:  
  `%USERPROFILE%\.cloudflared\<TUNNEL_ID>.json`  
  (e.g. `C:\Users\Tom\.cloudflared\abc123-uuid.json`)

### 2. Create the config file

1. In the project root, copy the example config:
   - Copy `cloudflared-config.example.yml` to `cloudflared-config.yml`.
2. Open `cloudflared-config.yml` and replace:
   - **YOUR_TUNNEL_ID** — the UUID from step 1 (in both `tunnel:` and `credentials-file:`).
   - **C:\Users\YOUR_WINDOWS_USER** — your Windows username (so the credentials path is correct).
   - **api.yourdomain.com** — the hostname you will use for the API (must be a hostname you can add in Cloudflare).

Example after edit:

```yaml
tunnel: abc12345-1234-1234-1234-abcdef123456
credentials-file: C:\Users\Tom\.cloudflared\abc12345-1234-1234-1234-abcdef123456.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
```

Save the file.

### 3. Route your hostname to the tunnel in Cloudflare

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) (or the dashboard for the domain you use).
2. **Networks** → **Tunnels** → select the tunnel **ary-backend**.
3. **Public Hostname** → **Add a public hostname**:
   - **Subdomain:** e.g. `api` (so the URL is `https://api.yourdomain.com`), or choose the hostname you put in the config.
   - **Domain:** select the domain you added to Cloudflare.
   - **Service type:** HTTP.
   - **URL:** `localhost:3001` (or `http://localhost:3001` if required).
4. Save.

If your domain is not on Cloudflare yet: add the domain in the Cloudflare dashboard and update its nameservers at your registrar. Then add the public hostname for the tunnel as above.

### 4. Set VITE_API_URL in Vercel (once)

- In Vercel: **Settings** → **Environment Variables**.
- Set **VITE_API_URL** = `https://api.yourdomain.com` (no trailing slash; use the hostname you configured).
- Redeploy the frontend so the new value is baked in.

After this, you do **not** need to change VITE_API_URL when you restart the backend or the tunnel.

### 5. Run backend + fixed tunnel

- Double-click **run-backend-and-tunnel-fixed.bat** (or run it from the project root).
- It starts the backend and then the tunnel using `cloudflared-config.yml`. Your API will be available at `https://api.yourdomain.com` (or whatever hostname you set) every time.

## Summary

| Item | Quick tunnel (current) | Fixed tunnel (this doc) |
|------|-------------------------|---------------------------|
| URL | Changes every restart | Same URL every time |
| Setup | None | One-time: create tunnel, config, DNS/hostname |
| VITE_API_URL | Update in Vercel after each new URL | Set once in Vercel |
| Run script | run-backend-and-tunnel.bat | run-backend-and-tunnel-fixed.bat |

Add `cloudflared-config.yml` to `.gitignore` so you do not commit your tunnel ID or paths.
