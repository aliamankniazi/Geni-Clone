# Niazi Tribe Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Setup
- [ ] Copy `env.production.example` to `.env.production`
- [ ] Fill in all required environment variables:
  - [ ] MySQL database credentials
  - [ ] Neo4j database credentials
  - [ ] Redis connection URL
  - [ ] JWT secrets (generate secure random strings)
  - [ ] SMTP email configuration
  - [ ] S3/MinIO storage credentials
  - [ ] Update CORS_ORIGINS with your domain

### 2. Database Setup
- [ ] **MySQL Setup**:
  - [ ] Create production MySQL database
  - [ ] Create database user with appropriate permissions
  - [ ] Run initial schema: `mysql -u user -p database < apps/api/src/database/migrations/init.sql`
  
- [ ] **Neo4j Setup**:
  - [ ] Install Neo4j (version 5.11 or later)
  - [ ] Configure authentication
  - [ ] Install APOC plugin for advanced procedures

- [ ] **Redis Setup**:
  - [ ] Install Redis (version 7 or later)
  - [ ] Configure persistence if needed
  - [ ] Set up password authentication

### 3. Security Configuration
- [ ] Generate strong JWT_SECRET (minimum 32 characters)
- [ ] Generate strong REFRESH_TOKEN_SECRET (minimum 32 characters)
- [ ] Set BCRYPT_SALT_ROUNDS to 12 or higher
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules for database ports

### 4. Build Process
- [ ] Install dependencies: `npm install`
- [ ] Build API: `npm run build:api`
- [ ] Build UI: `npm run build:ui`
- [ ] Build other services if needed: `npm run build:gedcom`

## Deployment Options

### Option 1: Docker Deployment
```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose logs -f
```

### Option 2: Railway Deployment
1. Create three Railway services:
   - API Service (use `railway.json`)
   - UI Service (use `railway-ui.json`)
   - GEDCOM Service (use `railway-gedcom.json`)
2. Add environment variables to each service
3. Connect to managed databases (MySQL, Redis)
4. Deploy using Railway CLI or GitHub integration

### Option 3: Traditional VPS Deployment
1. **API Server**:
   ```bash
   cd apps/api
   npm install --production
   npm run build
   npm start
   ```

2. **UI Server**:
   ```bash
   cd apps/ui
   npm install --production
   npm run build
   npm start
   ```

3. **Process Management** (PM2 recommended):
   ```bash
   pm2 start npm --name "geni-api" -- run start:api
   pm2 start npm --name "geni-ui" -- run start:ui
   pm2 save
   pm2 startup
   ```

### Option 4: Kubernetes Deployment
- Use provided Docker images
- Create Kubernetes manifests for each service
- Set up ingress for routing
- Configure persistent volumes for databases

## Post-Deployment Steps

### 1. Verification
- [ ] Check API health endpoint: `https://api.yourdomain.com/health`
- [ ] Verify database connections in logs
- [ ] Test user registration and login
- [ ] Verify file upload functionality
- [ ] Check WebSocket connections for real-time features

### 2. Monitoring Setup
- [ ] Configure application logs aggregation
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up database backups

### 3. Performance Optimization
- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Set up database query optimization
- [ ] Enable gzip compression

### 4. Security Hardening
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set secure HTTP headers
- [ ] Regular security updates

## Troubleshooting

### Common Issues
1. **Database Connection Failed**:
   - Check credentials in environment variables
   - Verify database is running and accessible
   - Check firewall rules

2. **Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version (requires 18+)

3. **CORS Errors**:
   - Verify CORS_ORIGINS includes your frontend URL
   - Check API_BASE_URL in frontend configuration

4. **File Upload Issues**:
   - Verify S3/MinIO credentials
   - Check bucket permissions
   - Ensure MAX_FILE_SIZE is appropriate

## Maintenance

### Regular Tasks
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Monitor disk space usage
- [ ] Review application logs
- [ ] Update SSL certificates before expiration

### Scaling Considerations
- Add more API replicas for high traffic
- Implement database read replicas
- Use Redis clustering for cache scaling
- Consider CDN for global distribution

## Support Resources
- Documentation: `/MYSQL_SETUP.md`
- Railway Guide: `/RAILWAY_DEPLOYMENT_GUIDE.md`
- Environment Template: `/env.production.example` 