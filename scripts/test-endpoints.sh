#!/bin/bash
# Test endpoints after setup

echo "🧪 Testing endpoints..."
echo ""

echo "1. Testing /api/health..."
curl -s -w "\n   Status: %{http_code}, Time: %{time_total}s\n" --max-time 10 http://localhost:3001/api/health || echo "   ❌ Failed or timeout"
echo ""

echo "2. Testing /api/users/me..."
curl -s -w "\n   Status: %{http_code}, Time: %{time_total}s\n" --max-time 10 http://localhost:3001/api/users/me || echo "   ❌ Failed or timeout"
echo ""

echo "3. Testing /api/payload-boot-test..."
curl -s -w "\n   Status: %{http_code}, Time: %{time_total}s\n" --max-time 10 http://localhost:3001/api/payload-boot-test || echo "   ❌ Failed or timeout"
echo ""

echo "✅ Tests complete"

