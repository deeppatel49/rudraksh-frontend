const DEFAULT_ABOUT_STATS = [
  { label: "Happy Customers", value: "25,000+" },
  { label: "Products Available", value: "2,500+" },
  { label: "Licensed Pharmacists", value: "6" },
  { label: "Daily Orders", value: "900+" },
];

const DEFAULT_HIGHLIGHTS = [
  "Every medicine is sourced from licensed and verified supply partners",
  "Prescription and OTC guidance is handled by trained pharmacy staff",
  "Cold-chain and sensitive items are handled with strict quality checks",
];

export async function getAboutPageContent() {
  return {
    trustStats: DEFAULT_ABOUT_STATS,
    highlights: DEFAULT_HIGHLIGHTS,
    source: "local",
  };
}
