/**
 * Import products from local data to Supabase
 * Run with: npm run import-products
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Manually read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
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
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Make sure .env.local has:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Supabase credentials loaded');
console.log(`   URL: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample products to import using schema columns: SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp
async function getSampleProducts() {
  return [
    { SrNo: 1, Item_Name: 'Paracetamol 500mg', Company: 'Cipla Ltd', Generic: 'Paracetamol', ItemType: 'Tablet', Category: 'Pain Relief', Pack: '10 Tablets', Mrp: 15.50 },
    { SrNo: 2, Item_Name: 'Vitamin C 1000mg', Company: 'HealthKart', Generic: 'Ascorbic Acid', ItemType: 'Tablet', Category: 'Wellness', Pack: '30 Tablets', Mrp: 250.00 },
    { SrNo: 3, Item_Name: 'Crocin Pain Relief', Company: 'GSK', Generic: 'Paracetamol', ItemType: 'Tablet', Category: 'Pain Relief', Pack: '15 Tablets', Mrp: 25.00 },
    { SrNo: 4, Item_Name: 'First Aid Kit', Company: 'MediCare', Generic: 'Multi', ItemType: 'Kit', Category: 'First Aid', Pack: '1 Kit', Mrp: 499.00 },
    { SrNo: 5, Item_Name: 'Hand Sanitizer 500ml', Company: 'Dettol', Generic: 'Alcohol', ItemType: 'Sanitizer', Category: 'Wellness', Pack: '500ml', Mrp: 150.00 },
    { SrNo: 6, Item_Name: 'Chyawanprash 500g', Company: 'Dabur', Generic: 'Ayurvedic', ItemType: 'Supplement', Category: 'Ayurvedic', Pack: '500g', Mrp: 285.00 },
    { SrNo: 7, Item_Name: 'Cetirizine 10mg', Company: 'Sun Pharma', Generic: 'Cetirizine HCl', ItemType: 'Tablet', Category: 'Allergy', Pack: '10 Tablets', Mrp: 20.00 },
    { SrNo: 8, Item_Name: 'Vitamin D3 60000 IU', Company: 'HealthKart', Generic: 'Cholecalciferol', ItemType: 'Capsule', Category: 'Wellness', Pack: '4 Capsules', Mrp: 120.00 }
  ];
}

async function importProducts() {
  console.log('🚀 Starting product import to Supabase...\n');

  try {
    // Get sample products
    const productsForSupabase = await getSampleProducts();
    
    console.log(`📦 Found ${productsForSupabase.length} sample products to import\n`);

    // Import products
    console.log('📤 Uploading products...');

    const { data, error } = await supabase
      .from('products')
      .insert(productsForSupabase);

    if (error) {
      console.error('\n❌ Error importing products:', error.message);
      console.error('Full error:', error);
      process.exit(1);
    }

    console.log('✅ Products imported successfully!\n');

    // Verify the import
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error verifying import:', countError.message);
    } else {
      console.log(`✅ Total products in database: ${count}\n`);
    }

    console.log('✨ Import completed!\n');
    console.log('💡 Next steps:');
    console.log('   1. Restart your dev server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/products');
    console.log('   3. You should now see the imported products!\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importProducts();
