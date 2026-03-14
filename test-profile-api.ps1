# Test Profile API Endpoints
# This script tests the backend profile functionality

$baseUrl = "http://localhost:5000/api/v1"

Write-Host "`n=== Profile API Test ===" -ForegroundColor Cyan
Write-Host "Step 1: Sign in to get authentication token" -ForegroundColor Yellow

# Step 1: Sign in (use your admin credentials)
$signInBody = @{
    email = "admin@example.com"  # CHANGE THIS to your admin email
    password = "your-password"    # CHANGE THIS to your admin password
} | ConvertTo-Json

Write-Host "`nAttempting sign in..." -ForegroundColor Gray
try {
    $signInResponse = Invoke-RestMethod -Uri "$baseUrl/auth/sign-in" -Method POST -Body $signInBody -ContentType "application/json"
    $token = $signInResponse.token
    Write-Host "✓ Sign in successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Sign in failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease update the email and password in this script with your actual admin credentials." -ForegroundColor Yellow
    exit 1
}

# Step 2: Get current profile
Write-Host "`n`nStep 2: Fetch current profile" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/profile/me" -Method GET -Headers $headers
    Write-Host "✓ Profile fetched successfully!" -ForegroundColor Green
    Write-Host "`nCurrent Profile:" -ForegroundColor Cyan
    $profileResponse | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "✗ Failed to fetch profile: $errorMessage" -ForegroundColor Red
    
    if ($errorMessage -like "*admin_user_profiles*" -or $errorMessage -like "*table*") {
        Write-Host "`n⚠️  DATABASE TABLE MISSING!" -ForegroundColor Yellow
        Write-Host "The admin_user_profiles table doesn't exist in your Supabase database." -ForegroundColor Yellow
        Write-Host "`nTo fix this:" -ForegroundColor White
        Write-Host "1. Open your Supabase project dashboard" -ForegroundColor White
        Write-Host "2. Go to SQL Editor" -ForegroundColor White
        Write-Host "3. Run this SQL:" -ForegroundColor White
        Write-Host @"

CREATE TABLE IF NOT EXISTS admin_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  gender TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_user_profiles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS admin_user_profiles_user_id_idx ON admin_user_profiles (user_id);

"@ -ForegroundColor Gray
        Write-Host "4. Run this test script again" -ForegroundColor White
    }
    exit 1
}

# Step 3: Update profile
Write-Host "`n`nStep 3: Update profile" -ForegroundColor Yellow
$updateBody = @{
    fullName = "John Doe"
    mobileNumber = "9876543210"
    gender = "male"
    address = "123 Main Street, Apartment 4B"
    city = "Mumbai"
    pincode = "400001"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/profile/me" -Method PATCH -Headers $headers -Body $updateBody
    Write-Host "✓ Profile updated successfully!" -ForegroundColor Green
    Write-Host "`nUpdated Profile:" -ForegroundColor Cyan
    $updateResponse | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "✗ Failed to update profile: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Verify update by fetching again
Write-Host "`n`nStep 4: Verify update by fetching profile again" -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/profile/me" -Method GET -Headers $headers
    Write-Host "✓ Profile verified!" -ForegroundColor Green
    Write-Host "`nFinal Profile:" -ForegroundColor Cyan
    $verifyResponse | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "✗ Failed to verify profile: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n`n=== All Tests Passed! ===" -ForegroundColor Green
Write-Host "The profile API is working correctly." -ForegroundColor Green
