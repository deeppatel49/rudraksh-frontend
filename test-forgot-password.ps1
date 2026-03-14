# Quick Test Guide for Forgot Password Feature - PowerShell Version
# Usage: powershell -ExecutionPolicy Bypass -File test-forgot-password.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Forgot Password Feature - Quick Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking if dev server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Dev server is running on port 3000" -ForegroundColor Green
} catch {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✓ Dev server is running on port 3001" -ForegroundColor Green
    } catch {
        Write-Host "✗ Dev server not running" -ForegroundColor Red
        Write-Host "Start it with: npm run dev" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Manual Testing Steps" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Navigate to Login Page" -ForegroundColor Yellow
Write-Host "URL: http://localhost:3000/login"
Write-Host ""

Write-Host "Step 2: On Login Page" -ForegroundColor Yellow
Write-Host "- If you have an account: Try to login with wrong password"
Write-Host "- You should see a 'Forgot Password?' button below the password field"
Write-Host ""

Write-Host "Step 3: Click 'Forgot Password?' Button" -ForegroundColor Yellow
Write-Host "- URL should change to: http://localhost:3000/forgot-password"
Write-Host "- You should see a form asking for email or mobile number"
Write-Host ""

Write-Host "Step 4: Send OTP" -ForegroundColor Yellow
Write-Host "- Enter your registered email address"
Write-Host "- Click 'Send OTP' button"
Write-Host "- Check your email for OTP from Rudraksh Pharmacy"
Write-Host ""

Write-Host "Step 5: Verify OTP" -ForegroundColor Yellow
Write-Host "- Copy the OTP from email"
Write-Host "- Paste it into the OTP field"
Write-Host "- Click 'Verify OTP' button"
Write-Host ""

Write-Host "Step 6: Reset Password" -ForegroundColor Yellow
Write-Host "- Enter your new password (at least 6 characters)"
Write-Host "- Confirm the password"
Write-Host "- Click 'Reset Password' button"
Write-Host "- You should see a success message"
Write-Host ""

Write-Host "Step 7: Login with New Password" -ForegroundColor Yellow
Write-Host "- Click 'Back to Login' or go to /login"
Write-Host "- Enter your email and new password"
Write-Host "- You should be logged in successfully"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Expected Email" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "When OTP is sent, you should receive an email with:" -ForegroundColor White
Write-Host "- Professional Rudraksh Pharmacy header" -ForegroundColor Gray
Write-Host "- Large, easy-to-read OTP code" -ForegroundColor Gray
Write-Host "- 5-minute expiration warning" -ForegroundColor Gray
Write-Host "- Security notices" -ForegroundColor Gray
Write-Host "- Instructions for password reset" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Troubleshooting" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Email not received?" -ForegroundColor Yellow
Write-Host "   - Check spam/promotions folder" -ForegroundColor Gray
Write-Host "   - Verify SMTP credentials in .env.local" -ForegroundColor Gray
Write-Host "   - Check browser console for errors" -ForegroundColor Gray
Write-Host ""

Write-Host "2. OTP verification fails?" -ForegroundColor Yellow
Write-Host "   - Ensure OTP hasn't expired (5 minutes)" -ForegroundColor Gray
Write-Host "   - Check that you entered the correct OTP" -ForegroundColor Gray
Write-Host "   - Try requesting a new OTP" -ForegroundColor Gray
Write-Host ""

Write-Host "3. SMTP error?" -ForegroundColor Yellow
Write-Host "   - Verify .env.local has correct SMTP configuration" -ForegroundColor Gray
Write-Host "   - For Gmail: Generate app password from https://myaccount.google.com/apppasswords" -ForegroundColor Gray
Write-Host "   - For other providers: Check provider documentation" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " API Endpoints (For Developers)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Send OTP:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:3000/api/auth/otp/send \" -ForegroundColor Gray
Write-Host "  -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "  -d '{\"identifier\":\"your_email@gmail.com\",\"email\":\"your_email@gmail.com\"}'" -ForegroundColor Gray
Write-Host ""

Write-Host "Verify OTP:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:3000/api/auth/otp/verify \" -ForegroundColor Gray
Write-Host "  -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "  -d '{\"identifier\":\"your_email@gmail.com\",\"otp\":\"123456\"}'" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
