# VibeHost Coolify Deployment Guide

This guide explains how to deploy VibeHost to your Coolify instance on AWS EC2 using the domain `hostingpoint.net`.

## Prerequisites

1.  **Coolify Installed**: You already have Coolify running on your EC2 instance.
2.  **DNS Configuration**:
    *   Point `hostingpoint.net` (A Record) to your EC2 IP.
    *   Point `www.hostingpoint.net` (CNAME) to `hostingpoint.net`.
    *   Point `api.hostingpoint.net` (A Record) to your EC2 IP.
    *   Point `*.hostingpoint.net` (A Record) to your EC2 IP (Wildcard for forums).

## Step 1: Prepare the Project in Coolify

1.  **Login to Coolify**.
2.  **Create a New Project** (e.g., "VibeHost").
3.  **Select Environment** (usually "Production").

## Step 2: Deploy the Backend (API)

1.  **Add Resource** -> **Public Repository**.
2.  **Repository URL**: `https://github.com/YOUR_USERNAME/Orbit` (Replace with your actual repo URL).
3.  **Build Pack**: Select **Nixpacks**.
4.  **Base Directory**: `/backend`.
5.  **Configuration**:
    *   **Name**: `vibehost-api`
    *   **Domain**: `https://api.hostingpoint.net`
    *   **Port Exposes**: `3000`
6.  **Environment Variables** (Add these in the "Environment Variables" tab):
    
    **Copy from `.env.coolify-template` file in the repo**
    
    **Required Variables:**
    *   `PORT`: `3000`
    *   `DOMAIN`: `hostingpoint.net`
    *   `NODE_ENV`: `production`
    *   `DB_PATH`: `/app/backend/database.sqlite`
    *   `JWT_SECRET`: (Generate a random secure string - use `openssl rand -base64 32`)
    *   `FRONTEND_URL`: `https://hostingpoint.net`
    
    **Stripe (Required for billing):**
    *   `STRIPE_SECRET_KEY`: `sk_live_...` (Your Stripe Secret Key)
    *   `STRIPE_PRICE_ID`: `price_...` (Your Stripe Price ID)
    *   `STRIPE_WEBHOOK_SECRET`: `whsec_...` (Your Stripe Webhook Secret)
    
    **Let's Encrypt SSL:**
    *   `ACME_EMAIL`: `admin@hostingpoint.net` (For SSL certificate notifications)
    
7.  **Storage (Volumes)** - CRITICAL FOR DATA PERSISTENCE:
    *   Go to **Storage** tab.
    *   Add a new volume:
        *   **Name**: `vibehost-db`
        *   **Mount Path**: `/app/backend` (This ensures `database.sqlite` persists).
8.  **Docker Socket Access** (CRITICAL):
    *   Go to **General** -> **Docker Options** (or "Advanced").
    *   You need to mount the Docker socket so the API can spawn forums.
    *   Add this to **Custom Docker Options** or **Volume Mounts**:
        *   `/var/run/docker.sock:/var/run/docker.sock`
9.  **Deploy** the backend.

## Step 3: Deploy the Frontend

1.  **Add Resource** -> **Public Repository** (Same repo).
2.  **Build Pack**: **Static** (or Nixpacks configured for static site).
3.  **Base Directory**: `/frontend`.
4.  **Configuration**:
    *   **Name**: `vibehost-frontend`
    *   **Domain**: `https://hostingpoint.net`, `https://www.hostingpoint.net`
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: `https://api.hostingpoint.net`
    *   `VITE_DOMAIN`: `hostingpoint.net`
    *   `VITE_STRIPE_PUBLIC_KEY`: (Your Stripe Public Key)
6.  **Deploy** the frontend.

## Step 4: Verify Deployment

1.  Visit `https://hostingpoint.net`.
2.  Register a new account.
3.  Try to deploy a forum (e.g., `testforum`).
4.  The backend should spawn the forum containers.
5.  Wait a few minutes and visit `https://testforum.hostingpoint.net`.

## Troubleshooting

*   **Forums not accessible?**
    *   Ensure the `coolify` network exists (`docker network ls`).
    *   Check if the spawned containers are running (`docker ps`).
    *   Check Traefik logs in Coolify.
*   **Database lost on restart?**
    *   Verify the Volume mount for `/app/backend`.

