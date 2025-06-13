# Niazi Tribe Deployment Fix Script (PowerShell)
# This script fixes common deployment issues

param(
    [switch]$Force
)

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue

function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

Write-Log "🔧 Starting Niazi Tribe Deployment Fix..."

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop first."
    exit 1
}

# Stop existing containers
Write-Log "Stopping existing containers..."
try {
    docker-compose down --remove-orphans
} catch {
    Write-Warning "No existing containers to stop"
}

# Remove old images to force rebuild
if ($Force) {
    Write-Log "Removing old images..."
    try {
        docker-compose down --rmi all --volumes --remove-orphans
    } catch {
        Write-Warning "Could not remove all images"
    }
    
    # Clean up Docker system
    Write-Log "Cleaning up Docker system..."
    try {
        docker system prune -f
    } catch {
        Write-Warning "Could not clean Docker system"
    }
}

# Install dependencies in all workspaces
Write-Log "Installing dependencies..."
try {
    npm install
    Write-Success "Dependencies installed"
} catch {
    Write-Warning "Some dependencies may have failed to install"
}

# Build all services
Write-Log "Building all services..."
try {
    npm run build --workspaces --if-present
} catch {
    Write-Warning "Some builds may have failed - this is expected for services without build scripts"
}

# Create necessary directories
Write-Log "Creating necessary directories..."
$directories = @(
    "services\gedcom\src",
    "services\gedcom\dist",
    "apps\api\dist",
    "apps\ui\.next"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Build and start services
Write-Log "Building and starting services..."
try {
    docker-compose build --no-cache
    Write-Success "Services built successfully"
} catch {
    Write-Error "Failed to build services"
    exit 1
}

Write-Log "Starting services..."
try {
    docker-compose up -d
    Write-Success "Services started"
} catch {
    Write-Error "Failed to start services"
    exit 1
}

# Wait for services to be ready
Write-Log "Waiting for services to start..."
Start-Sleep -Seconds 30

# Check service health
Write-Log "Checking service health..."

# Function to test URL
function Test-Url {
    param([string]$Url, [string]$ServiceName)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "$ServiceName is running"
            return $true
        }
    } catch {
        Write-Warning "$ServiceName may not be ready yet"
        return $false
    }
}

# Check services
Test-Url "http://localhost:7474" "Neo4j"
Test-Url "http://localhost:4000/health" "API"
Test-Url "http://localhost:3000/api/health" "UI"
Test-Url "http://localhost:5000/health" "GEDCOM Service"

# Check Redis
try {
    docker exec geni-redis redis-cli ping | Out-Null
    Write-Success "Redis is running"
} catch {
    Write-Warning "Redis may not be ready yet"
}

# Check PostgreSQL
try {
    docker exec geni-postgres pg_isready -U geni_user | Out-Null
    Write-Success "PostgreSQL is running"
} catch {
    Write-Warning "PostgreSQL may not be ready yet"
}

Write-Log "🎉 Deployment fix completed!"
Write-Log "Services should be available at:"
Write-Log "  - UI: http://localhost:3000"
Write-Log "  - API: http://localhost:4000"
Write-Log "  - GEDCOM Service: http://localhost:5000"
Write-Log "  - Neo4j Browser: http://localhost:7474"
Write-Log "  - RabbitMQ Management: http://localhost:15672"
Write-Log "  - MinIO Console: http://localhost:9001"

Write-Log "To check logs, run: docker-compose logs -f [service-name]"
Write-Log "To stop all services, run: docker-compose down" 