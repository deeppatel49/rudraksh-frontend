import path from "path";
import fs from "fs";
import { parseCSV, cleanPrice, cleanText } from "../lib/csv-parser";
import { medicines as preGeneratedMedicines } from "./medicines-data";

/**
 * Extract image URL from 1mg product URL
 * @param {string} drugUrl - 1mg product URL
 * @returns {string} Image URL or default
 */
function getImageUrl(drugUrl) {
  if (!drugUrl || drugUrl === "N/A") {
    return "/products/default-medicine.svg";
  }

  try {
    // Extract the drug slug from URL (e.g., aciloc-150-tablet-134660)
    const urlMatch = drugUrl.match(/\/drugs\/([^\/]+)$/);
    if (urlMatch && urlMatch[1]) {
      const drugSlug = urlMatch[1];
      // 1mg uses gumlet CDN for images
      return `https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/cropped/${drugSlug}.jpg`;
    }
  } catch (error) {
    console.error("Error extracting image URL:", error);
  }

  return "/products/default-medicine.svg";
}

/**
 * Load and transform medicine data from CSV
 * @returns {Array} Array of medicine products
 */
export function getMedicines() {
  const csvPath = path.join(process.cwd(), "app", "data", "onemg.csv");
  const rawData = fs.existsSync(csvPath) ? parseCSV(csvPath) : [];
  const hasExpectedSchema =
    rawData.length > 0
    && (Object.prototype.hasOwnProperty.call(rawData[0], "Drug_Name")
      || Object.prototype.hasOwnProperty.call(rawData[0], "Item Name")
      || Object.prototype.hasOwnProperty.call(rawData[0], "Selling_Price")
      || Object.prototype.hasOwnProperty.call(rawData[0], "Mrp")
      || Object.prototype.hasOwnProperty.call(rawData[0], "MRP"));

  if (!hasExpectedSchema) {
    return preGeneratedMedicines.map((item) => {
      const safePrice = Math.max(0, Number(item.price) || 0);

      return {
        id: item.id,
        name: item.name || "Unknown Medicine",
        category: item.category || "Medicine",
        price: safePrice || 99,
        description: item.description || "",
        image: item.image || "/products/default-medicine.svg",
        imageAlt: item.imageAlt || `${item.name || "Medicine"} medicine`,
        packSize: item.packSize || "",
        manufacturer: item.manufacturer || "N/A",
        marketer: item.marketer || "N/A",
        keyBenefits: Array.isArray(item.keyBenefits)
          ? item.keyBenefits
          : ["Consult your doctor for proper usage"],
        usage: item.usage || "",
        composition: item.composition || "N/A",
        storage: item.storage || "Store in a cool, dry place",
        precautions: item.precautions || "",
        prescriptionRequired: Boolean(item.prescriptionRequired),
        drugType: item.drugType || "Tablet",
        therapeuticClass: item.therapeuticClass || "N/A",
        actionClass: item.actionClass || "N/A",
        uses: item.uses || "",
        benefits: item.benefits || "",
        howItWorks: item.howItWorks || "",
        inStock: item.inStock !== false,
        drugUrl: item.drugUrl || "",
        alcoholInteraction: item.alcoholInteraction || "N/A",
        pregnancySafety: item.pregnancySafety || "N/A",
        breastfeedingSafety: item.breastfeedingSafety || "N/A",
        drivingSafety: item.drivingSafety || "N/A",
        kidneySafety: item.kidneySafety || "N/A",
        liverSafety: item.liverSafety || "N/A",
        habitForming: item.habitForming || "N/A",
        substituteCount: item.substituteCount || "0",
        substituteList: item.substituteList || "N/A",
        overallRating: item.overallRating || "N/A",
      };
    });
  }

  return rawData.map((item, index) => {
    const price = cleanPrice(item.Selling_Price || item.Mrp || item.MRP);
    const drugName = item.Drug_Name || item["Item Name"];
    const manufacturer = item.Manufacturer || item.Company || item.Marketer;
    const packSize = item.Pack || `${item.Pack_Size || ""} ${item.Pack_Type || ""}`.trim();
    const inStockFromData = item.In_Stock || item["In Stock"];
    const isInStock = typeof inStockFromData === "string"
      ? /^(yes|y|true|1|in stock)$/i.test(inStockFromData.trim())
      : item.In_Stock === "Yes";
    const categoryFromSheet = item.Category || "";

    return {
      id: `med-${index + 1}`,
      name: drugName || "Unknown Medicine",
      category: categorizeMedicine({ ...item, Category: categoryFromSheet }),
      price: price || 99,
      description: cleanText(item.Product_Introduction || item.Generic, 150),
      image: getImageUrl(item.Drug_URL),
      imageAlt: `${drugName || "Medicine"} medicine`,
      packSize: packSize || "",
      manufacturer: manufacturer || "N/A",
      marketer: item.Marketer || "N/A",
      keyBenefits: extractBenefits(item.Benefits || item.Generic),
      usage: cleanText(item.How_To_Use, 200),
      composition: item.Chemical_Class || "N/A",
      storage: cleanText(item.Storage_Conditions, 100) || "Store in a cool, dry place",
      precautions: cleanText(item.Common_Side_Effects, 200),
      prescriptionRequired: item.Prescription_Required === "Yes",
      drugType: item.Drug_Type || item.ItemType || "Tablet",
      therapeuticClass: item.Therapeutic_Class || "N/A",
      actionClass: item.Action_Class || "N/A",
      uses: item.Uses || "",
      benefits: cleanText(item.Benefits, 300) || "",
      howItWorks: cleanText(item.How_It_Works, 300) || "",
      inStock: isInStock,
      drugUrl: item.Drug_URL || "",
      // Safety Information
      alcoholInteraction: item.Alcohol_Interaction || "N/A",
      pregnancySafety: item.Pregnancy_Safety || "N/A",
      breastfeedingSafety: item.Breastfeeding_Safety || "N/A",
      drivingSafety: item.Driving_Safety || "N/A",
      kidneySafety: item.Kidney_Safety || "N/A",
      liverSafety: item.Liver_Safety || "N/A",
      habitForming: item.Habit_Forming || "N/A",
      // Substitutes
      substituteCount: item.Substitute_Count || "0",
      substituteList: item.Substitute_List || "N/A",
      // Rating
      overallRating: item.Overall_Rating || "N/A",
    };
  });
}

/**
 * Categorize medicine based on therapeutic class and type
 * @param {Object} item - Medicine data
 * @returns {string} Category name
 */
function categorizeMedicine(item) {
  const therapeuticClass = (item.Therapeutic_Class || "").toUpperCase();
  const drugType = (item.Drug_Type || item.ItemType || "").toLowerCase();
  const csvCategory = (item.Category || "").toLowerCase();

  if (csvCategory.includes("cosmetic")) return "Wellness";
  if (csvCategory.includes("surgical") || csvCategory.includes("medical")) return "First Aid";
  if (csvCategory.includes("ayurvedic")) return "Ayurvedic";
  if (csvCategory.includes("provision")) return "OTC";

  if (therapeuticClass.includes("RESPIRATORY")) return "OTC";
  if (therapeuticClass.includes("GASTRO")) return "OTC";
  if (therapeuticClass.includes("PAIN")) return "OTC";
  if (therapeuticClass.includes("ANTI INFECTIVES")) return "Medicine";
  if (therapeuticClass.includes("CARDIAC")) return "Medicine";
  if (therapeuticClass.includes("NEURO")) return "Medicine";
  if (therapeuticClass.includes("ANTI NEOPLASTICS")) return "Medicine";
  if (therapeuticClass.includes("BLOOD")) return "Medicine";
  if (therapeuticClass.includes("DERMA")) return "OTC";
  if (drugType.includes("syrup")) return "OTC";
  if (drugType.includes("tablet")) return "Medicine";
  if (drugType.includes("capsule")) return "Medicine";
  if (drugType.includes("injection")) return "Medicine";

  return "Medicine"; // Default category
}

/**
 * Extract benefits from benefits text
 * @param {string} benefitsText - Benefits text
 * @returns {Array} Array of benefit strings
 */
function extractBenefits(benefitsText) {
  if (!benefitsText || benefitsText === "N/A") {
    return ["Consult your doctor for proper usage"];
  }

  // Try to split by common delimiters
  const benefits = benefitsText
    .split(/\n|In Treatment of|In /)
    .filter((b) => b.trim())
    .map((b) => cleanText(b, 100))
    .filter((b) => b.length > 10)
    .slice(0, 3);

  return benefits.length > 0 ? benefits : ["Consult your doctor for proper usage"];
}

// Cache the medicines data
let medicinesCache = null;

/**
 * Get medicines with caching
 * @returns {Array} Array of medicine products
 */
export function getCachedMedicines() {
  if (!medicinesCache) {
    medicinesCache = getMedicines();
  }
  return medicinesCache;
}
