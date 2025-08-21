#!/bin/bash

# 🔍 Auto BPMN Deployment Health Check Script
# Sử dụng: ./check-deployment.sh [vercel-url] [render-url]

echo "🚀 Auto BPMN Deployment Health Check"
echo "=================================="

# Default URLs (update these with your actual URLs)
VERCEL_URL=${1:-"https://your-app.vercel.app"}
RENDER_URL=${2:-"https://your-app.onrender.com"}

echo "📱 Client URL: $VERCEL_URL"
echo "🖥️  Server URL: $RENDER_URL"
echo ""

# Check Client (Vercel)
echo "🔍 Checking Client (Vercel)..."
CLIENT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL")
if [ "$CLIENT_STATUS" = "200" ]; then
    echo "✅ Client is running (Status: $CLIENT_STATUS)"
else
    echo "❌ Client is down (Status: $CLIENT_STATUS)"
fi

# Check Server Health
echo ""
echo "🔍 Checking Server Health..."
HEALTH_URL="$RENDER_URL/api/health"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Server is running (Status: $HEALTH_STATUS)"
    # Get health details
    echo "📊 Server Health Details:"
    curl -s "$HEALTH_URL" | python3 -m json.tool 2>/dev/null || echo "Raw response: $(curl -s "$HEALTH_URL")"
else
    echo "❌ Server is down (Status: $HEALTH_STATUS)"
    if [ "$HEALTH_STATUS" = "000" ]; then
        echo "💡 Possible issues: Server is sleeping (Render free tier) or network error"
        echo "   Try again in 30-60 seconds if server was sleeping"
    fi
fi

# Check API Endpoints
echo ""
echo "🔍 Checking API Endpoints..."

# Check models endpoint
MODELS_URL="$RENDER_URL/api/models"
MODELS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$MODELS_URL")
if [ "$MODELS_STATUS" = "200" ]; then
    echo "✅ Models endpoint is working"
else
    echo "⚠️  Models endpoint status: $MODELS_STATUS"
fi

# Check generate endpoint (POST)
GENERATE_URL="$RENDER_URL/api/generate"
echo "ℹ️  Generate endpoint: $GENERATE_URL (requires POST request)"

echo ""
echo "🌐 CORS Check..."
CORS_HEADERS=$(curl -s -I -H "Origin: $VERCEL_URL" "$HEALTH_URL" | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "✅ CORS is configured"
    echo "$CORS_HEADERS"
else
    echo "⚠️  CORS headers not found - check CLIENT_URL environment variable"
fi

echo ""
echo "📋 Summary:"
echo "==========="
echo "Client Status: $([ "$CLIENT_STATUS" = "200" ] && echo "✅ OK" || echo "❌ FAIL")"
echo "Server Status: $([ "$HEALTH_STATUS" = "200" ] && echo "✅ OK" || echo "❌ FAIL")"
echo "API Status: $([ "$MODELS_STATUS" = "200" ] && echo "✅ OK" || echo "⚠️  CHECK")"

if [ "$CLIENT_STATUS" = "200" ] && [ "$HEALTH_STATUS" = "200" ]; then
    echo ""
    echo "🎉 Deployment appears to be healthy!"
    echo "💡 Test the full application at: $VERCEL_URL"
else
    echo ""
    echo "🔧 Troubleshooting:"
    echo "==================="
    
    if [ "$CLIENT_STATUS" != "200" ]; then
        echo "❌ Client Issues:"
        echo "   - Check Vercel deployment status"
        echo "   - Verify build completed successfully"
        echo "   - Check custom domain configuration"
    fi
    
    if [ "$HEALTH_STATUS" != "200" ]; then
        echo "❌ Server Issues:"
        echo "   - Check Render deployment logs"
        echo "   - Verify environment variables are set"
        echo "   - Check if server is sleeping (free tier)"
        echo "   - Verify start command: 'npm start'"
    fi
fi

echo ""
echo "🔗 Useful Links:"
echo "================"
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo "Render Dashboard: https://dashboard.render.com"
echo "MongoDB Atlas: https://cloud.mongodb.com"
