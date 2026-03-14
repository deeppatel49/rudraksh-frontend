#!/usr/bin/env node

/**
 * Product Database Diagnostic Tool
 * Tests Supabase connection and verifies data retrieval
 * Usage: node verify-products.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...msg) {
  console.log(color + msg.join(' ') + colors.reset);
}

async function runDiagnostics() {
  log(colors.cyan, '🔍 Product Database Diagnostic Tool');
  log(colors.cyan, '=====================================\n');

  // Step 1: Check environment variables
  log(colors.blue, '📋 Step 1: Checking Environment Variables...');
  
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    log(colors.red, '❌ .env.local file not found!');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  let supabaseUrl, supabaseKey;

  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim();
    }
  });

  if (!supabaseUrl || !supabaseKey) {
    log(colors.red, '❌ Missing Supabase credentials in .env.local');
    log(colors.yellow, '   Required:');
    log(colors.yellow, '   - NEXT_PUBLIC_SUPABASE_URL');
    log(colors.yellow, '   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  log(colors.green, '✅ Environment variables found');
  log(colors.blue, `   URL: ${supabaseUrl}`);
  log(colors.blue, `   Key: ${supabaseKey.substring(0, 20)}...`);

  // Step 2: Test Supabase connection
  log(colors.blue, '\n📌 Step 2: Testing Supabase Connection...');

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: testData, error: testError, count } = await supabase
      .from('products')
      .select('SrNo', { count: 'exact', head: true })
      .limit(1);

    if (testError) {
      log(colors.red, `❌ Connection failed: ${testError.message}`);
      return;
    }

    log(colors.green, '✅ Supabase connection successful');
  } catch (err) {
    log(colors.red, `❌ Connection error: ${err.message}`);
    return;
  }

  // Step 3: Check table structure
  log(colors.blue, '\n📊 Step 3: Checking Table Structure...');

  try {
    const { data: sampleData, error: structError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (structError) {
      log(colors.red, `❌ Cannot read table: ${structError.message}`);
      return;
    }

    if (!Array.isArray(sampleData) || sampleData.length === 0) {
      log(colors.yellow, '⚠️  Table exists but is empty');
      log(colors.yellow, '   Action: Import sample data using: npm run import-products');
      return;
    }

    const columns = Object.keys(sampleData[0]);
    const requiredColumns = ['SrNo', 'Item_Name', 'Company', 'Generic', 'ItemType', 'Category', 'Pack', 'Mrp'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));

    log(colors.green, '✅ Table structure verified');
    log(colors.blue, `   Found columns: ${columns.join(', ')}`);

    if (missingColumns.length > 0) {
      log(colors.yellow, `⚠️  Missing columns: ${missingColumns.join(', ')}`);
      log(colors.yellow, '   These columns may be required for full functionality');
    }
  } catch (err) {
    log(colors.red, `❌ Structure check failed: ${err.message}`);
    return;
  }

  // Step 4: Count products
  log(colors.blue, '\n📦 Step 4: Counting Products...');

  try {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (countError) {
      log(colors.red, `❌ Count failed: ${countError.message}`);
      return;
    }

    log(colors.green, `✅ Total products in database: ${count}`);

    if (count === 0) {
      log(colors.yellow, '⚠️  Database is empty!');
      log(colors.yellow, '   Run: npm run import-products');
      return;
    }
  } catch (err) {
    log(colors.red, `❌ Count error: ${err.message}`);
    return;
  }

  // Step 5: Test fetching with pagination
  log(colors.blue, '\n🔀 Step 5: Testing Pagination Query...');

  try {
    const { data: pageData, error: pageError, count: pageCount } = await supabase
      .from('products')
      .select('SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp', { count: 'exact' })
      .order('SrNo', { ascending: true })
      .range(0, 4);

    if (pageError) {
      log(colors.red, `❌ Pagination failed: ${pageError.message}`);
      return;
    }

    log(colors.green, `✅ Pagination working (fetched ${pageData.length} of ${pageCount} products)`);
    log(colors.blue, '   First product:');
    if (pageData.length > 0) {
      log(colors.blue, `   - ID: ${pageData[0].SrNo}`);
      log(colors.blue, `   - Name: ${pageData[0].Item_Name}`);
      log(colors.blue, `   - Category: ${pageData[0].Category}`);
    }
  } catch (err) {
    log(colors.red, `❌ Pagination error: ${err.message}`);
    return;
  }

  // Step 6: Test search functionality
  log(colors.blue, '\n🔍 Step 6: Testing Search Functionality...');

  try {
    const { data: searchData, error: searchError } = await supabase
      .from('products')
      .select('SrNo, Item_Name, Category', { count: 'exact' })
      .ilike('Item_Name', '%tablet%')
      .limit(5);

    if (searchError) {
      log(colors.red, `❌ Search failed: ${searchError.message}`);
      return;
    }

    log(colors.green, `✅ Search working (found ${searchData.length} products matching 'tablet')`);
  } catch (err) {
    log(colors.red, `❌ Search error: ${err.message}`);
    return;
  }

  // Final summary
  log(colors.green, '\n✅ All Diagnostics Passed!');
  log(colors.cyan, '\n🎉 Your Supabase products database is properly configured and ready to use.\n');
}

// Run diagnostics
runDiagnostics().catch(err => {
  log(colors.red, `\n❌ Unexpected error: ${err.message}`);
  process.exit(1);
});
