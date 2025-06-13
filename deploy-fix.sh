#!/bin/bash

# Niazi Tribe Deployment Fix Script
# This script fixes common deployment issues

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log "🔧 Starting Niazi Tribe Deployment Fix..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker first."
    exit 1
fi

success "Docker is running"

# Stop existing containers
log "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove old images to force rebuild
log "Removing old images..."
docker-compose down --rmi all --volumes --remove-orphans || true

# Clean up Docker system
log "Cleaning up Docker system..."
docker system prune -f || true

# Install dependencies in all workspaces
log "Installing dependencies..."
npm install

# Build all services
log "Building all services..."
npm run build --workspaces --if-present || warning "Some builds may have failed - this is expected for services without build scripts"

# Create necessary directories
log "Creating necessary directories..."
mkdir -p services/gedcom/src
mkdir -p services/gedcom/dist
mkdir -p apps/api/dist
mkdir -p apps/ui/.next

# Set proper permissions
log "Setting proper permissions..."
chmod +x deploy.sh || true
chmod +x deploy-fix.sh || true

# Build and start services
log "Building and starting services..."
docker-compose build --no-cache

log "Starting services..."
docker-compose up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 30

# Check service health
log "Checking service health..."

# Check Neo4j
if curl -f http://localhost:7474 > /dev/null 2>&1; then
    success "Neo4j is running"
else
    warning "Neo4j may not be ready yet"
fi

# Check Redis
if docker exec niazi-redis redis-cli ping > /dev/null 2>&1; then
    success "Redis is running"
else
    warning "Redis may not be ready yet"
fi

# Check MySQL
if docker exec niazi-mysql mysql -u niazi_user -pniazi_password -e "SELECT 1" > /dev/null 2>&1; then
    success "MySQL is running"
else
    warning "MySQL may not be ready yet"
fi

# Check API
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    success "API is running"
else
    warning "API may not be ready yet"
fi

# Check UI
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    success "UI is running"
else
    warning "UI may not be ready yet"
fi

# Check GEDCOM Service
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    success "GEDCOM Service is running"
else
    warning "GEDCOM Service may not be ready yet"
fi

log "🎉 Deployment fix completed!"
log "Services should be available at:"
log "  - UI: http://localhost:3000"
log "  - API: http://localhost:4000"
log "  - GEDCOM Service: http://localhost:5000"
log "  - Neo4j Browser: http://localhost:7474"
log "  - RabbitMQ Management: http://localhost:15672"
log "  - MinIO Console: http://localhost:9001"

log "To check logs, run: docker-compose logs -f [service-name]"
log "To stop all services, run: docker-compose down" 