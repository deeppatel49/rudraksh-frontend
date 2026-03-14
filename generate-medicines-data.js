const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// Clean price function (same as in csv-parser.js)
function cleanPrice(priceStr) {
  if (!priceStr || priceStr === "N/A") return 0;
  const cleaned = priceStr.replace(/[₹,\s?]/g, "");
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

// Read CSV
const csvPath = path.join(__dirname, 'app', 'data', 'onemg.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');
const lines = fileContent.split('\n').filter(line => line.trim());

if (lines.length === 0) {
  fs.writeFileSync(
    path.join(__dirname, 'app', 'data', 'medicines-data.js'),
    'export const medicines = [];'
  );
  console.log('Created empty medicines data');
  process.exit(0);
}

const headers = lines[0].split(',').map(h => h.trim());
const medicines = [];

for (let i = 1; i < Math.min(lines.length, 10000); i++) {
  const values = parseCSVLine(lines[i]);
  if (values.length === headers.length) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    const price = cleanPrice(row['Selling_Price']) || cleanPrice(row['MRP']) || 99;
    const mrp = cleanPrice(row['MRP']) || price * 1.2;
    
    medicines.push({
      id: `med-${i}`,
      name: row['Drug_Name'] || 'Unknown',
      price: price,
      mrp: mrp,
      image: '/products/default-medicine.svg',
      manufacturer: row['Manufacturer'] || row['Marketer'] || 'N/A',
      packSize: `${row['Pack_Size'] || ''} ${row['Pack_Type'] || ''}`.trim(),
      drugType: row['Drug_Type'] || 'Tablet',
      inStock: row['In_Stock'] !== 'No',
      category: 'Medicine'
    });
  }
}

const output = `/**
 * Pre-generated medicines data from CSV
 * This file is safe to import in client components
 * Generated at build time from onemg.csv
 */

export const medicines = ${JSON.stringify(medicines, null, 2)};
`;

fs.writeFileSync(
  path.join(__dirname, 'app', 'data', 'medicines-data.js'),
  output
);

console.log(`Generated medicines data with ${medicines.length} items`);

