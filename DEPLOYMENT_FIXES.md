# Deployment Fixes Applied

This document summarizes all the deployment issues that were identified and fixed in the Niazi Tribe project.

## Issues Fixed

### 1. **Missing GEDCOM Service**
**Problem**: The `docker-compose.yml` referenced a GEDCOM service that didn't exist.

**Solution**: Created the complete GEDCOM service with:
- `services/gedcom/Dockerfile`
- `services/gedcom/package.json`
- `services/gedcom/tsconfig.json`
- `services/gedcom/src/index.ts` (basic service implementation)
- `services/gedcom/src/health-check.js`

### 2. **API Dockerfile Issues**
**Problem**: 
- Missing TypeScript build step
- Incorrect health check path
- Installing only production dependencies before build

**Solution**: 
- Added TypeScript build step in Dockerfile
- Fixed health check path to `src/health-check.js`
- Install all dependencies first, build, then prune dev dependencies

### 3. **UI Dockerfile Issues**
**Problem**: Health check used `curl` but it wasn't installed in Alpine image.

**Solution**: Added `curl` installation in the UI Dockerfile.

### 4. **Docker Compose Configuration**
**Problem**: 
- Missing port mapping for GEDCOM service
- Missing environment variables
- Duplicate configuration entries

**Solution**: 
- Added port mapping `5000:5000` for GEDCOM service
- Added proper environment variables
- Fixed YAML formatting issues

### 5. **Workspace Configuration**
**Problem**: Root `package.json` didn't include services in workspaces.

**Solution**: Added `"services/*"` to the workspaces array.

## New Files Created

### GEDCOM Service Files:
- `services/gedcom/Dockerfile`
- `services/gedcom/package.json`
- `services/gedcom/tsconfig.json`
- `services/gedcom/src/index.ts`
- `services/gedcom/src/health-check.js`

### Deployment Scripts:
- `deploy-fix.sh` (Linux/Mac)
- `deploy-fix.ps1` (Windows PowerShell)

## How to Deploy

### Option 1: Use the Fix Script (Recommended)

**For Windows:**
```powershell
.\deploy-fix.ps1
```

**For Linux/Mac:**
```bash
./deploy-fix.sh
```

### Option 2: Manual Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build services:**
   ```bash
   npm run build --workspaces --if-present
   ```

3. **Start with Docker Compose:**
   ```bash
    --no-cache
   docker-compose up -d
   ```

## Service Endpoints

After successful deployment, the following services will be available:

- **UI**: http://localhost:3000
- **API**: http://localhost:4000
- **GEDCOM Service**: http://localhost:5000
- **Neo4j Browser**: http://localhost:7474
- **RabbitMQ Management**: http://localhost:15672 (user: geni, pass: geni_password)
- **MinIO Console**: http://localhost:9001 (user: minioadmin, pass: minioadmin123)

## Health Check Endpoints

- API: `GET http://localhost:4000/health`
- UI: `GET http://localhost:3000/api/health`
- GEDCOM Service: `GET http://localhost:5000/health`

## Troubleshooting

### If services fail to start:

1. **Check Docker is running:**
   ```bash
   docker info
   ```

2. **Check logs:**
   ```bash
   docker-compose logs -f [service-name]
   ```

3. **Restart specific service:**
   ```bash
   docker-compose restart [service-name]
   ```

4. **Clean rebuild:**
   ```bash
   docker-compose down --rmi all --volumes
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Common Issues:

- **Port conflicts**: Make sure ports 3000, 4000, 5000, 5432, 6379, 7474, 7687, 9000, 9001, 9200, 15672 are not in use
- **Memory issues**: Ensure Docker has enough memory allocated (at least 4GB recommended)
- **Permission issues**: On Linux/Mac, make sure scripts are executable with `chmod +x`

## Environment Variables

Copy `env.example` to `.env` and update the values as needed:

```bash
cp env.example .env
```

Key variables to configure:
- `JWT_SECRET`: Change to a secure random string
- `POSTGRES_PASSWORD`: Change to a secure password
- `NEO4J_PASSWORD`: Change to a secure password
- Email configuration for notifications
- AWS/S3 configuration for file uploads

## Next Steps

1. **Implement GEDCOM Processing**: The GEDCOM service currently has placeholder endpoints. Implement actual GEDCOM parsing and import functionality.

2. **Add Authentication**: Ensure all services properly validate JWT tokens.

3. **Configure Production Environment**: Update environment variables and security settings for production deployment.

4. **Set up CI/CD**: Configure automated testing and deployment pipelines.

5. **Monitor Services**: Set up logging and monitoring for production use. 