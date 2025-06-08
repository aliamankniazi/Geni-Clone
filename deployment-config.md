# Geni Clone Deployment Guide

## Step-by-Step Production Deployment

### 1. Platform Selection
We'll deploy on **Railway** for the following reasons:
- Easy multi-service deployment
- Built-in PostgreSQL, Redis, and other database services
- Automatic SSL certificates
- GitHub integration
- Environment variable management
- Reasonable pricing for genealogy apps

### 2. Database Services Setup

#### 2.1 PostgreSQL Database
```bash
# Railway PostgreSQL service will provide:
DATABASE_URL=postgresql://username:password@host:port/database
```

#### 2.2 Redis Cache
```bash
# Railway Redis service will provide:
REDIS_URL=redis://default:password@host:port
```

#### 2.3 Neo4j Database
Since Railway doesn't offer Neo4j, we'll use Neo4j AuraDB (managed cloud service):
1. Sign up at https://console.neo4j.io/
2. Create a free instance
3. Get connection details:
```bash
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-generated-password
```

### 3. File Storage Setup

#### 3.1 AWS S3 Setup
1. Create AWS account
2. Create S3 bucket: `geni-clone-media-prod`
3. Create IAM user with S3 permissions
4. Get credentials:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=geni-clone-media-prod
```

### 4. Email Service Setup

#### 4.1 SendGrid Setup (recommended)
1. Sign up at https://sendgrid.com/
2. Create API key
3. Configure:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com
```

### 5. Environment Variables for Production

#### API Service Environment Variables:
```bash
# Server
NODE_ENV=production
PORT=4000

# CORS
CORS_ORIGINS=https://your-frontend-domain.railway.app

# Database
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
REDIS_URL=redis://default:password@host:port

# PostgreSQL (provided by Railway)
DATABASE_URL=postgresql://username:password@host:port/database

# Security
JWT_SECRET=super-secure-jwt-secret-256-bit-minimum
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=super-secure-refresh-secret-256-bit-minimum
BCRYPT_SALT_ROUNDS=12

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=geni-clone-media-prod

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Client
CLIENT_URL=https://your-frontend-domain.railway.app

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

#### UI Service Environment Variables:
```bash
# Next.js
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app
NEXT_PUBLIC_APP_NAME=Geni Clone
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 6. Deployment Steps

#### 6.1 Prepare Repository
1. Push all code to GitHub
2. Ensure package.json files have correct scripts
3. Verify Dockerfiles are present

#### 6.2 Deploy to Railway

**Step 1: Deploy API Service**
1. Go to https://railway.app/
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose "apps/api" as root directory
6. Configure environment variables from above
7. Deploy

**Step 2: Deploy UI Service**
1. Add another service to the same project
2. Select same GitHub repository
3. Choose "apps/ui" as root directory
4. Configure environment variables
5. Make sure NEXT_PUBLIC_API_URL points to deployed API
6. Deploy

**Step 3: Set up Databases**
1. Add PostgreSQL service to Railway project
2. Add Redis service to Railway project
3. Create Neo4j AuraDB instance separately
4. Update connection strings in environment variables

### 7. DNS and Domain Setup

#### 7.1 Custom Domain (Optional)
1. Purchase domain from provider (Namecheap, GoDaddy, etc.)
2. In Railway dashboard, add custom domain
3. Update DNS records as instructed
4. Update CORS_ORIGINS and CLIENT_URL environment variables

### 8. Production Testing Checklist

#### 8.1 Health Checks
- [ ] API health endpoint: `GET https://your-api-domain.railway.app/health`
- [ ] UI health endpoint: `GET https://your-ui-domain.railway.app/api/health`

#### 8.2 Authentication Flow
- [ ] User registration works
- [ ] Email verification works
- [ ] User login works
- [ ] JWT token refresh works
- [ ] Password reset works

#### 8.3 Core Features
- [ ] Family tree creation/editing
- [ ] Person profiles CRUD operations
- [ ] Media upload functionality
- [ ] Real-time collaboration via WebSocket
- [ ] Search functionality

#### 8.4 Database Connectivity
- [ ] Neo4j connection established
- [ ] PostgreSQL connection established
- [ ] Redis connection established
- [ ] Data persistence works

#### 8.5 External Services
- [ ] Email sending works
- [ ] File uploads to S3 work
- [ ] File downloads from S3 work

### 9. Monitoring and Maintenance

#### 9.1 Application Monitoring
- Monitor Railway logs for errors
- Set up application performance monitoring (APM)
- Configure error tracking (Sentry)

#### 9.2 Database Monitoring
- Monitor Neo4j AuraDB metrics
- Monitor Railway PostgreSQL metrics
- Monitor Redis performance

#### 9.3 Backup Strategy
- Regular PostgreSQL backups via Railway
- Neo4j automatic backups via AuraDB
- S3 versioning enabled for media files

### 10. Scaling Considerations

#### 10.1 Horizontal Scaling
- Railway auto-scaling for API and UI services
- Neo4j AuraDB handles scaling automatically
- Redis cluster for high availability

#### 10.2 Performance Optimization
- CDN for static assets (CloudFlare)
- Database query optimization
- Caching strategies
- Image optimization

### 11. Security Checklist

- [ ] HTTPS enforced
- [ ] Strong JWT secrets
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] File upload restrictions
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

## Testing Commands

After deployment, run these commands to test:

```bash
# Health checks
curl https://your-api-domain.railway.app/health
curl https://your-ui-domain.railway.app/api/health

# API functionality
curl -X POST https://your-api-domain.railway.app/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpassword123","firstName":"Test","lastName":"User","username":"testuser"}'

# WebSocket connectivity test (from browser console)
const socket = io('https://your-api-domain.railway.app', {
  auth: { token: 'your-jwt-token' }
});
socket.on('connect', () => console.log('Connected!'));
```

## Cost Estimation

- Railway (API + UI + PostgreSQL + Redis): ~$20-40/month
- Neo4j AuraDB: Free tier available, paid plans from $65/month
- AWS S3: Pay-as-you-go, typically $1-10/month for small-medium usage
- SendGrid: Free tier (100 emails/day), paid plans from $15/month
- Domain: $10-15/year

**Total estimated monthly cost: $25-70/month** depending on usage and features. 