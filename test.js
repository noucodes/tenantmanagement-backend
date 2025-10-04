import { companiesTable } from "./initdb";

(async () => {
  console.log("🔧 Testing companiesTable only...");
  await companiesTable();
  console.log("✅ companiesTable resolved successfully!");
})();
