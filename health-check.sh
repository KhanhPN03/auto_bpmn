#!/bin/bash

# Health Check Script for Auto BPMN Deployment
# Usage: ./health-check.sh [server-url]

SERVER_URL=${1:-"https://auto-bpmn.onrender.com"}
echo "🔍 Health Check for Auto BPMN Server: $SERVER_URL"
echo "=================================================="

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local expected_status=${3:-200}
    
    echo -n "Testing $method $endpoint ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$SERVER_URL$endpoint")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ OK ($response)"
    else
        echo "❌ FAIL ($response)"
    fi
}

# Basic health check
echo "🔍 Basic Health Checks:"
check_endpoint "/health"

# API endpoints
echo ""
echo "🔍 API Endpoints:"
check_endpoint "/api/questions/bpmn"
check_endpoint "/api/questions/industry/general"
check_endpoint "/api/processes" "GET" "200"

# Test a simple POST (should fail with validation error but not 500)
echo ""
echo "🔍 POST Endpoint Validation:"
echo -n "Testing POST /api/processes/generate (should return 400 for validation) ... "
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SERVER_URL/api/processes/generate" \
    -H "Content-Type: application/json" \
    -d '{}')

if [ "$response" = "400" ]; then
    echo "✅ OK (validation working)"
elif [ "$response" = "500" ]; then
    echo "❌ FAIL (server error)"
else
    echo "⚠️  UNEXPECTED ($response)"
fi

echo ""
echo "🎯 Health Check Complete!"
echo "If you see 500 errors, check the server logs on Render."
