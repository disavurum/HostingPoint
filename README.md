
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Domain name configured to point to your server
- Ports 80, 443, and 8080 open in firewall

## Quick Start

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd VibeHost
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your domain and email
   ```

3. **Deploy**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DOMAIN=vibehost.io
ACME_EMAIL=admin@vibehost.io
POSTGRES_PASSWORD=changeme
REDIS_PASSWORD=changeme
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./backend/database.sqlite
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@vibehost.io
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=10
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

See `.env.example` for all available configuration options.

### DNS Configuration

Ensure your domain DNS records point to your server:
- `*.vibehost.io` → Your server IP (for wildcard subdomains)
- `api.vibehost.io` → Your server IP
- `traefik.vibehost.io` → Your server IP (optional, for Traefik dashboard)

## Project Structure

```
.
├── backend/              # Node.js API
│   ├── services/        # Business logic
│   ├── customers/       # Generated docker-compose files (auto-created)
│   └── server.js        # Express server
├── frontend/            # React application
│   ├── src/
│   └── dist/            # Build output
├── letsencrypt/         # SSL certificates (auto-created)
├── docker-compose.yml   # Main infrastructure
└── deploy.sh            # Deployment script
```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" },
  "token": "jwt-token-here"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe", "isAdmin": false },
  "token": "jwt-token-here"
}
```

#### GET `/api/auth/me`
Get current user information (requires authentication).

**Headers:** `Authorization: Bearer <token>`

### Forum Management

#### POST `/api/deploy`
Deploy a new Discourse forum (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "forumName": "oyun-severler",
  "email": "admin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Forum deployed successfully",
  "forumUrl": "https://oyun-severler.vibehost.io",
  "forum": {
    "id": 1,
    "name": "oyun-severler",
    "status": "active",
    "url": "https://oyun-severler.vibehost.io"
  }
}
```

#### GET `/api/status/:forumName`
Get the status of a deployed forum (requires authentication, owner only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "forumName": "oyun-severler",
  "running": true,
  "containers": [...],
  "forum": {
    "id": 1,
    "name": "oyun-severler",
    "email": "admin@example.com",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/forums`
List all forums for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "forums": [
    {
      "id": 1,
      "name": "oyun-severler",
      "email": "admin@example.com",
      "status": "active",
      "url": "https://oyun-severler.vibehost.io",
      "running": true,
      "containers": [...]
    }
  ]
}
```

#### DELETE `/api/forums/:forumName`
Delete a forum (requires authentication, owner only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Forum \"oyun-severler\" deleted successfully"
}
```

### Admin Endpoints

#### GET `/api/admin/forums`
List all forums (admin only).

**Headers:** `Authorization: Bearer <token>`

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Security Features

✅ **Implemented:**
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on all API endpoints
- CORS protection
- Security headers (Helmet)
- Input validation
- SQL injection protection (parameterized queries)
- Error handling without exposing sensitive information

**Security Recommendations:**
- Change default passwords in production
- Use strong, unique passwords for PostgreSQL and Redis
- Generate a strong JWT_SECRET (use `openssl rand -base64 32`)
- Keep Docker and system packages updated
- Regularly review container logs
- Configure SMTP for email notifications
- Enable HTTPS only in production
- Regularly backup the database

## Troubleshooting

### Containers not starting
- Check Docker logs: `docker-compose logs`
- Verify Docker socket permissions
- Ensure ports are not already in use

### SSL certificates not generating
- Verify DNS is pointing to your server
- Check Traefik logs: `docker-compose logs traefik`
- Ensure port 80 is accessible for HTTP challenge

### Forum deployment fails
- Check backend logs: `docker-compose logs backend`
- Verify forum name format (lowercase, alphanumeric, hyphens only)
- Check disk space: `df -h`

## License

ISC

