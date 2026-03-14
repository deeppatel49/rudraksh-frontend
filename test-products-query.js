#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Read environment variables using proper regex handling
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Products Query');
console.log('========================\n');
console.log('URL:', supabaseUrl);
console.log('Key valid:', !!supabaseKey && supabaseKey.length > 20 ? 'Yes' : 'No');
console.log('Key:', supabaseKey?.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Test 1: Get count
  console.log('Test 1: Getting count...');
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('❌ Count error:', countError);
  } else {
    console.log('✅ Total count:', count);
  }

  // Test 2: Get first 5 products
  console.log('\nTest 2: Getting first 5 products...');
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(5);

  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Retrieved:', data.length, 'products');
    if (data.length > 0) {
      console.log('First product:', JSON.stringify(data[0], null, 2));
    }
  }
}

test().catch(console.error);
