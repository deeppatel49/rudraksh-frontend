import fs from "fs";
import path from "path";

/**
 * Parse CSV file and convert to array of objects
 * @param {string} filePath - Path to the CSV file
 * @returns {Array} Array of objects representing CSV rows
 */
export function parseCSV(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`CSV file not found: ${filePath}`);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    if (fileContent.startsWith("PK")) {
      console.warn(`Invalid CSV content (looks like XLSX/ZIP): ${path.basename(filePath)}`);
      return [];
    }
    const lines = fileContent.split("\n").filter((line) => line.trim());

    if (lines.length === 0) return [];

    // Get headers from first line
    const headers = lines[0].split(",").map((header) => header.trim());

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return [];
  }
}

/**
 * Parse a CSV line handling quoted values and commas within quotes
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Clean price string and convert to number
 * @param {string} priceStr - Price string like "? 1,899.00"
 * @returns {number} Cleaned price as number
 */
export function cleanPrice(priceStr) {
  if (!priceStr || priceStr === "N/A") return 0;
  // Remove currency symbols, commas, and extra spaces
  const cleaned = priceStr.replace(/[?₹,\s]/g, "");
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

/**
 * Clean and truncate text
 * @param {string} text - Text to clean
 * @param {number} maxLength - Maximum length
 * @returns {string} Cleaned text
 */
export function cleanText(text, maxLength = 200) {
  if (!text || text === "N/A") return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (maxLength && cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength) + "...";
  }
  return cleaned;
}
