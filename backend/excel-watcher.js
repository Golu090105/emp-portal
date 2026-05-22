const mysql = require("mysql2/promise");
const XLSX  = require("xlsx");
const path  = require("path");
const fs    = require("fs");

// ── CONFIG ─────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host:     "localhost",
  user:     "root",
  password: "Golu@2005",
  database: "employee_onboarding",
};

// Parse --interval flag (default 30 seconds)
const args     = process.argv.slice(2);
const iIdx     = args.indexOf("--interval");
const INTERVAL = iIdx !== -1 ? parseInt(args[iIdx + 1], 10) * 1000 : 30_000;

const EXCEL_DIR  = path.join(__dirname, "public", "exports");
async function exportToExcel(pool) {
    const fileName = `employee_onboarding_${Date.now()}.xlsx`;
const filePath = path.join(EXCEL_DIR, fileName); }

if (!fs.existsSync(EXCEL_DIR)) {
  fs.mkdirSync(EXCEL_DIR, { recursive: true });
  console.log("✅ Created public/exports/");
}

// ── HELPERS ────────────────────────────────────────────────────────────
function autoFitColumns(ws) {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  const colWidths = [];
  for (let C = range.s.c; C <= range.e.c; C++) {
    let maxLen = 10;
    for (let R = range.s.r; R <= range.e.r; R++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.v != null) {
        maxLen = Math.max(maxLen, String(cell.v).length + 2);
      }
    }
    colWidths.push({ wch: Math.min(maxLen, 50) });
  }
  ws["!cols"] = colWidths;
}
// ── MAIN EXPORT FUNCTION ───────────────────────────────────────────────
async function exportToExcel(pool) {

  const fileName = `employee_onboarding_${Date.now()}.xlsx`;
  const filePath = path.join(EXCEL_DIR, fileName);

  const [onboardRows] = await pool.query(
    "SELECT * FROM onboarding_requests ORDER BY id DESC"
  );
  const [extRows] = await pool.query(
    "SELECT * FROM extension_requests ORDER BY id DESC"
  );

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(
    onboardRows.length
      ? onboardRows
      : [{ message: "No onboarding records yet." }]
  );
  autoFitColumns(ws1);
  XLSX.utils.book_append_sheet(wb, ws1, "Onboarding Requests");

  const ws2 = XLSX.utils.json_to_sheet(
    extRows.length
      ? extRows
      : [{ message: "No extension records yet." }]
  );
  autoFitColumns(ws2);
  XLSX.utils.book_append_sheet(wb, ws2, "Extension Requests");

  const summary = [
    { Metric: "Total Onboarding Records", Value: onboardRows.length },
    { Metric: "Total Extension Requests", Value: extRows.length },
    {
      Metric: "Employees Extended (Yes)",
      Value: extRows.filter(r => r.extension === "Yes").length,
    },
    { Metric: "Last Refreshed", Value: new Date().toLocaleString("en-IN") },
  ];

  const ws3 = XLSX.utils.json_to_sheet(summary);
  autoFitColumns(ws3);
  XLSX.utils.book_append_sheet(wb, ws3, "Summary");

  XLSX.writeFile(wb, filePath);

  return filePath;
}
// ── POLLING LOOP ───────────────────────────────────────────────────────
let lastOnboardCount = -1;
let lastExtCount     = -1;
async function tick(pool) {
  try {
    const [[{ cnt: onboardCount }]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM onboarding_requests"
    );
    const [[{ cnt: extCount }]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM extension_requests"
    );
    const changed =
    onboardCount !== lastOnboardCount ||
    extCount !== lastExtCount;

    if (changed) {
     const filePath = await exportToExcel(pool);
      console.log(`✅ Excel created → ${filePath}`);

      // 🔥 update last counts
      lastOnboardCount = onboardCount;
      lastExtCount = extCount;
    }

  } catch (err) {
    console.error("❌ Watcher error:", err.message);
  }
}
// ── ENTRY POINT ────────────────────────────────────────────────────────
(async () => {
  console.log("🚀 Excel Watcher started");
  console.log(`   Interval : ${INTERVAL / 1000}s`);
  console.log(`   Output   : Dynamic files in /public/exports`);
  console.log("─────────────────────────────────────────");

  const pool = await mysql.createPool(DB_CONFIG);

  // Run immediately on start
  await tick(pool);

  // Then poll on interval
  setInterval(() => tick(pool), INTERVAL);
})();