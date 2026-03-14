const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
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

console.log('Testing Products Query...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

supabase
  .from('products')
  .select('SrNo, Item_Name, ItemType, Category', { count: 'exact' })
  .range(0, 4)
  .order('Item_Name', { ascending: true })
  .then(({ data, error, count }) => {
    if (error) {
      console.log('❌ Error:', error);
    } else {
      console.log('✅ Success!');
      console.log('Total products:', count);
      console.log('First 5 products:', JSON.stringify(data, null, 2));
    }
  });
