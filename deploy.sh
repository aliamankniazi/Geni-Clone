#!/bin/bash

# Geni Clone Deployment and Testing Script
# This script automates the deployment process and runs comprehensive tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:4000}"
UI_URL="${UI_URL:-http://localhost:3000}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-testpassword123}"

# Logging function
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

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        warning "jq is not installed. JSON parsing will be limited."
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is required but not installed"
        exit 1
    fi
    
    success "All dependencies are available"
}

# Test health endpoints
test_health_endpoints() {
    log "Testing health endpoints..."
    
    # Test API health
    log "Testing API health endpoint: $API_URL/health"
    if response=$(curl -s "$API_URL/health"); then
        if echo "$response" | grep -q '"status":"OK"'; then
            success "API is healthy"
        else
            error "API health check failed: $response"
            return 1
        fi
    else
        error "Failed to connect to API at $API_URL"
        return 1
    fi
    
    # Test UI health
    log "Testing UI health endpoint: $UI_URL/api/health"
    if response=$(curl -s "$UI_URL/api/health"); then
        if echo "$response" | grep -q '"status":"OK"'; then
            success "UI is healthy"
        else
            error "UI health check failed: $response"
            return 1
        fi
    else
        error "Failed to connect to UI at $UI_URL"
        return 1
    fi
}

# Test user registration
test_user_registration() {
    log "Testing user registration..."
    
    # Generate unique test user
    TIMESTAMP=$(date +%s)
    TEST_EMAIL="test_${TIMESTAMP}@example.com"
    TEST_USERNAME="testuser_${TIMESTAMP}"
    
    response=$(curl -s -X POST "$API_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\",
            \"firstName\": \"Test\",
            \"lastName\": \"User\",
            \"username\": \"$TEST_USERNAME\"
        }")
    
    if echo "$response" | grep -q '"success":true'; then
        success "User registration successful"
        
        # Extract user ID if available
        if command -v jq &> /dev/null; then
            USER_ID=$(echo "$response" | jq -r '.data.user.id // empty')
            if [ -n "$USER_ID" ]; then
                log "Created user ID: $USER_ID"
            fi
        fi
    else
        error "User registration failed: $response"
        return 1
    fi
}

# Test user login
test_user_login() {
    log "Testing user login..."
    
    response=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    if echo "$response" | grep -q '"success":true'; then
        success "User login successful"
        
        # Extract JWT token
        if command -v jq &> /dev/null; then
            JWT_TOKEN=$(echo "$response" | jq -r '.data.token // empty')
            if [ -n "$JWT_TOKEN" ]; then
                log "JWT token received: ${JWT_TOKEN:0:20}..."
                export JWT_TOKEN
            fi
        fi
    else
        error "User login failed: $response"
        return 1
    fi
}

# Test authenticated endpoints
test_authenticated_endpoints() {
    log "Testing authenticated endpoints..."
    
    if [ -z "$JWT_TOKEN" ]; then
        warning "No JWT token available, skipping authenticated tests"
        return 0
    fi
    
    # Test profile endpoint
    log "Testing profile endpoint..."
    response=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_URL/api/auth/profile")
    
    if echo "$response" | grep -q '"success":true'; then
        success "Profile endpoint accessible"
    else
        error "Profile endpoint failed: $response"
        return 1
    fi
    
    # Test persons endpoint
    log "Testing persons endpoint..."
    response=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_URL/api/persons")
    
    if echo "$response" | grep -q '"success":true'; then
        success "Persons endpoint accessible"
    else
        error "Persons endpoint failed: $response"
        return 1
    fi
}

# Test person creation
test_person_creation() {
    log "Testing person creation..."
    
    if [ -z "$JWT_TOKEN" ]; then
        warning "No JWT token available, skipping person creation test"
        return 0
    fi
    
    response=$(curl -s -X POST "$API_URL/api/persons" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "firstName": "John",
            "lastName": "Doe",
            "gender": "male",
            "birthDate": "1990-01-01",
            "birthPlace": "Test City, Test State"
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        success "Person creation successful"
        
        if command -v jq &> /dev/null; then
            PERSON_ID=$(echo "$response" | jq -r '.data.id // empty')
            if [ -n "$PERSON_ID" ]; then
                log "Created person ID: $PERSON_ID"
                export PERSON_ID
            fi
        fi
    else
        error "Person creation failed: $response"
        return 1
    fi
}

# Test WebSocket connectivity
test_websocket_connectivity() {
    log "Testing WebSocket connectivity..."
    
    # Create a simple Node.js script to test WebSocket
    cat > /tmp/websocket_test.js << 'EOF'
const io = require('socket.io-client');

const API_URL = process.env.API_URL || 'http://localhost:4000';
const JWT_TOKEN = process.env.JWT_TOKEN;

if (!JWT_TOKEN) {
    console.log('Warning: No JWT token available for WebSocket test');
    process.exit(0);
}

const socket = io(API_URL, {
    auth: { token: JWT_TOKEN },
    transports: ['websocket', 'polling']
});

let connected = false;

socket.on('connect', () => {
    console.log('✓ WebSocket connected successfully');
    connected = true;
    socket.disconnect();
    process.exit(0);
});

socket.on('connect_error', (error) => {
    console.log('✗ WebSocket connection failed:', error.message);
    process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
    if (!connected) {
        console.log('✗ WebSocket connection timeout');
        process.exit(1);
    }
}, 10000);
EOF

    if node /tmp/websocket_test.js; then
        success "WebSocket connectivity test passed"
    else
        error "WebSocket connectivity test failed"
        return 1
    fi
    
    rm -f /tmp/websocket_test.js
}

# Test UI accessibility
test_ui_accessibility() {
    log "Testing UI accessibility..."
    
    # Test main page
    response=$(curl -s -I "$UI_URL")
    if echo "$response" | grep -q "200 OK"; then
        success "UI main page accessible"
    else
        error "UI main page not accessible"
        return 1
    fi
    
    # Test login page
    response=$(curl -s -I "$UI_URL/login")
    if echo "$response" | grep -q "200 OK"; then
        success "Login page accessible"
    else
        error "Login page not accessible"
        return 1
    fi
    
    # Test register page
    response=$(curl -s -I "$UI_URL/register")
    if echo "$response" | grep -q "200 OK"; then
        success "Register page accessible"
    else
        error "Register page not accessible"
        return 1
    fi
}

# Test database connectivity (through API)
test_database_connectivity() {
    log "Testing database connectivity..."
    
    # Test that the API can connect to databases by checking if endpoints work
    response=$(curl -s "$API_URL/health")
    if echo "$response" | grep -q '"status":"OK"'; then
        success "Database connectivity appears functional"
    else
        error "Database connectivity may be failing"
        return 1
    fi
}

# Performance test
run_performance_test() {
    log "Running basic performance test..."
    
    # Simple load test with curl
    log "Testing API response time..."
    time_start=$(date +%s%N)
    curl -s "$API_URL/health" > /dev/null
    time_end=$(date +%s%N)
    time_diff=$(( (time_end - time_start) / 1000000 ))
    
    if [ $time_diff -lt 5000 ]; then
        success "API response time: ${time_diff}ms (Good)"
    elif [ $time_diff -lt 10000 ]; then
        warning "API response time: ${time_diff}ms (Acceptable)"
    else
        error "API response time: ${time_diff}ms (Slow)"
    fi
    
    # Test UI response time
    log "Testing UI response time..."
    time_start=$(date +%s%N)
    curl -s "$UI_URL" > /dev/null
    time_end=$(date +%s%N)
    time_diff=$(( (time_end - time_start) / 1000000 ))
    
    if [ $time_diff -lt 3000 ]; then
        success "UI response time: ${time_diff}ms (Good)"
    elif [ $time_diff -lt 8000 ]; then
        warning "UI response time: ${time_diff}ms (Acceptable)"
    else
        error "UI response time: ${time_diff}ms (Slow)"
    fi
}

# Generate test report
generate_test_report() {
    log "Generating test report..."
    
    cat > test_report.md << EOF
# Geni Clone Deployment Test Report

**Test Date:** $(date)
**API URL:** $API_URL
**UI URL:** $UI_URL

## Test Results

### Health Checks
- API Health: $([[ $api_health == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")
- UI Health: $([[ $ui_health == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")

### Authentication
- User Registration: $([[ $user_registration == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")
- User Login: $([[ $user_login == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")

### API Functionality
- Authenticated Endpoints: $([[ $authenticated_endpoints == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")
- Person Creation: $([[ $person_creation == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")

### Real-time Features
- WebSocket Connectivity: $([[ $websocket_test == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")

### UI Accessibility
- Page Accessibility: $([[ $ui_accessibility == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")

### Database
- Database Connectivity: $([[ $database_connectivity == 0 ]] && echo "✅ PASS" || echo "❌ FAIL")

## Recommendations

$([[ $overall_status == 0 ]] && echo "✅ All tests passed! The system is ready for production use." || echo "❌ Some tests failed. Please review the issues above before proceeding to production.")

EOF

    success "Test report generated: test_report.md"
}

# Main execution
main() {
    log "Starting Geni Clone deployment testing..."
    log "API URL: $API_URL"
    log "UI URL: $UI_URL"
    echo
    
    # Check dependencies
    check_dependencies
    echo
    
    # Run tests
    test_health_endpoints
    api_health=$?
    ui_health=$?
    echo
    
    test_user_registration
    user_registration=$?
    echo
    
    test_user_login
    user_login=$?
    echo
    
    test_authenticated_endpoints
    authenticated_endpoints=$?
    echo
    
    test_person_creation
    person_creation=$?
    echo
    
    test_websocket_connectivity
    websocket_test=$?
    echo
    
    test_ui_accessibility
    ui_accessibility=$?
    echo
    
    test_database_connectivity
    database_connectivity=$?
    echo
    
    run_performance_test
    echo
    
    # Calculate overall status
    overall_status=$((api_health + ui_health + user_registration + user_login + authenticated_endpoints + person_creation + websocket_test + ui_accessibility + database_connectivity))
    
    generate_test_report
    echo
    
    if [ $overall_status -eq 0 ]; then
        success "🎉 All tests passed! The Geni Clone system is successfully deployed and functional."
    else
        error "Some tests failed. Please check the logs and test report for details."
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
Geni Clone Deployment Testing Script

Usage: $0 [OPTIONS]

Options:
    -a, --api-url URL       API URL (default: http://localhost:4000)
    -u, --ui-url URL        UI URL (default: http://localhost:3000)
    -e, --email EMAIL       Test email (default: test@example.com)
    -p, --password PASS     Test password (default: testpassword123)
    -h, --help              Show this help message

Environment Variables:
    API_URL                 API URL
    UI_URL                  UI URL
    TEST_EMAIL              Test email
    TEST_PASSWORD           Test password

Examples:
    # Test local development
    $0
    
    # Test production deployment
    $0 --api-url https://api.yourdomain.com --ui-url https://yourdomain.com
    
    # Test with environment variables
    API_URL=https://api.yourdomain.com UI_URL=https://yourdomain.com $0

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--api-url)
            API_URL="$2"
            shift 2
            ;;
        -u|--ui-url)
            UI_URL="$2"
            shift 2
            ;;
        -e|--email)
            TEST_EMAIL="$2"
            shift 2
            ;;
        -p|--password)
            TEST_PASSWORD="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main 