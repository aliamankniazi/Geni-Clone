# Railway Deployment Guide for Niazi Tribe

This guide explains how to deploy the Niazi Tribe monorepo to Railway with multiple services.

## Overview

Niazi Tribe is a **shared monorepo** containing multiple applications:
- **API Service** (`apps/api`) - Express.js backend
- **UI Service** (`apps/ui`) - Next.js frontend  
- **GEDCOM Service** (`services/gedcom`) - GEDCOM processing microservice

Railway requires each service to be deployed separately for optimal performance and scalability.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your Niazi Tribe repository must be accessible to Railway
3. **Node.js 18+**: Ensure your project uses Node.js 18 or higher

## Deployment Options

### Option 1: Deploy All Services (Recommended for Production)

Create **3 separate Railway services** for complete functionality:

#### 1. API Service (Backend)
- **Configuration**: Uses `railway.json` 
- **Build Command**: `npm run build:api`
- **Start Command**: `npm run start:api`
- **Port**: 4000

#### 2. UI Service (Frontend)  
- **Configuration**: Uses `railway-ui.json`
- **Build Command**: `npm run build:ui`
- **Start Command**: `npm run start:ui`
- **Port**: 3000

#### 3. GEDCOM Service (Microservice)
- **Configuration**: Uses `railway-gedcom.json`
- **Build Command**: `npm run build:gedcom` 
- **Start Command**: `npm run start:gedcom`
- **Port**: 5000

### Option 2: Deploy Single Service (Quick Test)

Deploy just the **API service** for initial testing:
- Uses the main `railway.json` configuration
- Provides backend functionality only

## Step-by-Step Deployment

### For All Services (Option 1):

1. **Create Railway Project**
   ```bash
   # Using Railway CLI (optional)
   railway login
   railway init
   ```

2. **Deploy API Service**
   - Connect your GitHub repository
   - Railway will use `railway.json` by default
   - Set environment variables in Railway dashboard
   - Deploy and note the service URL

3. **Deploy UI Service**  
   - Create a new service in the same Railway project
   - Connect the same GitHub repository
   - In service settings, set custom start command: `npm run start:ui`
   - In service settings, set custom build command: `npm run build:ui`
   - Set `NEXT_PUBLIC_API_URL` environment variable to API service URL
   - Deploy

4. **Deploy GEDCOM Service**
   - Create a third service in the Railway project
   - Connect the same GitHub repository  
   - In service settings, set custom start command: `npm run start:gedcom`
   - In service settings, set custom build command: `npm run build:gedcom`
   - Set required environment variables
   - Deploy

### For Single Service (Option 2):

1. **Quick Deploy API Only**
   - Connect GitHub repository to Railway
   - Railway automatically uses `railway.json`
   - Set environment variables
   - Deploy

## Environment Variables

Configure these environment variables for each service in the Railway dashboard:

### API Service Environment Variables
```bash
NODE_ENV=production
PORT=4000
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-postgres-url
REDIS_URL=your-redis-url
NEO4J_URI=your-neo4j-uri
NEO4J_PASSWORD=your-neo4j-password
RABBITMQ_URL=your-rabbitmq-url
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-s3-bucket
```

### UI Service Environment Variables
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://your-api-service.railway.app
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-ui-service.railway.app
```

### GEDCOM Service Environment Variables
```bash
NODE_ENV=production
PORT=5000
NEO4J_URI=your-neo4j-uri
NEO4J_PASSWORD=your-neo4j-password
RABBITMQ_URL=your-rabbitmq-url
```

## Railway Service Configuration

### Manual Configuration Steps

If Railway doesn't automatically detect the configuration:

1. **Go to Service Settings**
2. **Set Build Command**: 
   - API: `npm run build:api`
   - UI: `npm run build:ui`  
   - GEDCOM: `npm run build:gedcom`
3. **Set Start Command**:
   - API: `npm run start:api`
   - UI: `npm run start:ui`
   - GEDCOM: `npm run start:gedcom`
4. **Set Watch Paths** (Optional but recommended):
   - API: `apps/api/**/*`
   - UI: `apps/ui/**/*`
   - GEDCOM: `services/gedcom/**/*`

## Database Services

Add these database services to your Railway project:

### PostgreSQL Database
- Add PostgreSQL service from Railway marketplace
- Connect to API service via `DATABASE_URL`

### Redis Cache  
- Add Redis service from Railway marketplace
- Connect to API service via `REDIS_URL`

### Neo4j Database
- Use Railway's Neo4j template or external Neo4j service
- Connect to API and GEDCOM services

## Networking Between Services

Railway services can communicate using:

1. **Public Domains**: `https://service-name.railway.app`
2. **Private Networking**: Railway automatically provides private networking
3. **Environment Variables**: Use Railway's service reference variables:
   ```bash
   API_URL=${{api-service.RAILWAY_PUBLIC_DOMAIN}}
   ```

## Monitoring and Logs

- **View Logs**: Railway dashboard → Service → Deployments → View Logs
- **Metrics**: Railway dashboard → Service → Metrics
- **Health Checks**: Railway automatically monitors service health

## Troubleshooting

### Common Issues:

1. **"No start command found"**
   - Ensure `start` script exists in root `package.json`
   - Verify Railway service settings have correct start command

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are properly listed
   - Check build logs for specific errors

3. **Service Communication Issues**
   - Verify environment variables are set correctly
   - Check CORS configuration for cross-service requests
   - Ensure correct service URLs in environment variables

### Debug Commands:
```bash
# Check Railway CLI status
railway status

# View service logs
railway logs

# Check environment variables
railway variables
```

## Production Considerations

1. **Custom Domains**: Configure custom domains in Railway dashboard
2. **SSL Certificates**: Railway provides automatic SSL
3. **Scaling**: Configure auto-scaling in service settings
4. **Monitoring**: Set up monitoring and alerts
5. **Backups**: Configure database backups
6. **CI/CD**: Set up GitHub Actions for automated deployments

## Next Steps

After successful deployment:

1. **Test all services** using the provided URLs
2. **Configure custom domains** for production use
3. **Set up monitoring** and error tracking
4. **Configure CI/CD pipelines** for automated deployments
5. **Set up database backups** and disaster recovery

For support, refer to [Railway Documentation](https://docs.railway.app) or the Railway Discord community. 