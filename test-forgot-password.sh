#!/bin/bash

# Quick Test Guide for Forgot Password Feature
# Usage: bash test-forgot-password.sh

echo "=========================================="
echo " Forgot Password Feature - Quick Test"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dev server is running${NC}"
else
    echo -e "${RED}✗ Dev server not running on port 3000${NC}"
    echo "Start it with: npm run dev"
    exit 1
fi

echo ""
echo "=========================================="
echo " Manual Testing Steps"
echo "=========================================="
echo ""

echo -e "${YELLOW}Step 1: Navigate to Login Page${NC}"
echo "URL: http://localhost:3000/login"
echo ""

echo -e "${YELLOW}Step 2: On Login Page${NC}"
echo "- If you have an account: Try to login with wrong password"
echo "- You should see a 'Forgot Password?' button below the password field"
echo ""

echo -e "${YELLOW}Step 3: Click 'Forgot Password?' Button${NC}"
echo "- URL should change to: http://localhost:3000/forgot-password"
echo "- You should see a form asking for email or mobile number"
echo ""

echo -e "${YELLOW}Step 4: Send OTP${NC}"
echo "- Enter your registered email address"
echo "- Click 'Send OTP' button"
echo "- Check your email for OTP from Rudraksh Pharmacy"
echo ""

echo -e "${YELLOW}Step 5: Verify OTP${NC}"
echo "- Copy the OTP from email"
echo "- Paste it into the OTP field"
echo "- Click 'Verify OTP' button"
echo ""

echo -e "${YELLOW}Step 6: Reset Password${NC}"
echo "- Enter your new password (at least 6 characters)"
echo "- Confirm the password"
echo "- Click 'Reset Password' button"
echo "- You should see a success message"
echo ""

echo -e "${YELLOW}Step 7: Login with New Password${NC}"
echo "- Click 'Back to Login' or go to /login"
echo "- Enter your email and new password"
echo "- You should be logged in successfully"
echo ""

echo "=========================================="
echo " Expected Email${NC}"
echo "=========================================="
echo ""
echo "When OTP is sent, you should receive an email with:"
echo "- Professional Rudraksh Pharmacy header"
echo "- Large, easy-to-read OTP code"
echo "- 5-minute expiration warning"
echo "- Security notices"
echo "- Instructions for password reset"
echo ""

echo "=========================================="
echo " Troubleshooting${NC}"
echo "=========================================="
echo ""
echo "1. Email not received?"
echo "   - Check spam/promotions folder"
echo "   - Verify SMTP credentials in .env.local"
echo "   - Check browser console for errors"
echo ""

echo "2. OTP verification fails?"
echo "   - Ensure OTP hasn't expired (5 minutes)"
echo "   - Check that you entered the correct OTP"
echo "   - Try requesting a new OTP"
echo ""

echo "3. SMTP error?"
echo "   - Verify .env.local has correct SMTP configuration"
echo "   - For Gmail: Generate app password from https://myaccount.google.com/apppasswords"
echo "   - For other providers: Check provider documentation"
echo ""

echo "=========================================="
echo " API Endpoints (For Developers)"
echo "=========================================="
echo ""

echo "Send OTP:"
echo "curl -X POST http://localhost:3000/api/auth/otp/send \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"identifier\":\"your_email@gmail.com\",\"email\":\"your_email@gmail.com\"}'"
echo ""

echo "Verify OTP:"
echo "curl -X POST http://localhost:3000/api/auth/otp/verify \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"identifier\":\"your_email@gmail.com\",\"otp\":\"123456\"}'"
echo ""

echo "=========================================="
