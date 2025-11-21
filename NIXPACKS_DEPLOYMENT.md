# Coolify Frontend Deployment Guide (Nixpacks - Recommended)

Frontend Docker build'de sorun yaşıyorsan, **Nixpacks** ile deploy et. Daha basit ve Coolify tarafından optimize edilmiş.

## Method: Frontend with Nixpacks (Recommended)

### Step 1: Create Separate Frontend Resource

1. **Coolify → Your Project → Add Resource**
2. **Public Repository** seç
3. **Configuration:**
   - **Repository:** `https://github.com/disavurum/HostingPoint`
   - **Branch:** `master`
   - **Build Pack:** **Nixpacks** (default, don't change)
   - **Base Directory:** `/frontend`
   - **Port:** `3000` (Nixpacks will auto-detect)

### Step 2: Set Domain

**Domains:**
```
https://hostingpoint.net
https://www.hostingpoint.net
```

### Step 3: Environment Variables

Add these and **CHECK "Available at Buildtime":**
```
VITE_API_URL=https://api.hostingpoint.net
VITE_DOMAIN=hostingpoint.net
```

### Step 4: Deploy

Click **Deploy** - Nixpacks will:
1. Detect it's a Vite/React project
2. Run `npm install`
3. Run `npm run build`
4. Serve with a Node server

**Build time:** ~2-3 minutes

---

## Backend with Docker Compose

Keep backend in Docker Compose (it's working):

1. **Use:** `docker-compose.backend-only.yml`
2. **Or:** Deploy backend as separate **Nixpacks** resource too

### Backend as Nixpacks (Alternative)

1. **Add Resource → Public Repository**
2. **Base Directory:** `/backend`
3. **Port:** `3000`
4. **Domain:** `https://api.hostingpoint.net`
5. **Environment Variables:** (Same as before)
   - `DOMAIN=hostingpoint.net`
   - `JWT_SECRET=...`
   - `FRONTEND_URL=https://hostingpoint.net`
6. **Volumes:**
   - Add persistent volume: `/app/data` (for SQLite)
   - Mount Docker socket: `/var/run/docker.sock:/var/run/docker.sock`

---

## Why Nixpacks Instead of Docker Compose?

| Feature | Docker Compose | Nixpacks |
|---------|----------------|----------|
| Setup | Complex | Simple |
| Build Speed | Slower | Faster |
| Debugging | Harder | Easier |
| Multi-stage | Manual | Automatic |
| Best For | Production | Dev/Staging |

**For your case:** Nixpacks is simpler and will work immediately.

---

## Full Nixpacks Deployment (Both Services)

### 1. Backend Resource
- Base Dir: `/backend`
- Domain: `https://api.hostingpoint.net`
- Port: `3000`
- Volume: `/app/data` (persistent)
- Docker socket: `/var/run/docker.sock:/var/run/docker.sock`

### 2. Frontend Resource
- Base Dir: `/frontend`
- Domain: `https://hostingpoint.net`, `https://www.hostingpoint.net`
- Env (buildtime): `VITE_API_URL`, `VITE_DOMAIN`

Both will be deployed as separate resources but work together seamlessly.

---

## Quick Start

**Easiest path:**
1. Delete Docker Compose resource
2. Create 2 separate Nixpacks resources (backend + frontend)
3. Configure as above
4. Deploy both

Done! ✅
