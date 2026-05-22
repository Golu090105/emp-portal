const express = require("express");
const mysql   = require("mysql2/promise");
const cors    = require("cors");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const crypto  = require("crypto");
const XLSX    = require("xlsx");
const jwt     = require("jsonwebtoken");     // npm install jsonwebtoken
const bcrypt  = require("bcryptjs");         // npm install bcryptjs

const app = express();

app.use(cors({
  origin:      ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

const JWT_SECRET  = process.env.JWT_SECRET  || "emp_portal_secret_2025";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h";

// ── FOLDER SETUP ──────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); console.log("✅ Created uploads/"); }

const hrAttachmentDir = path.join(__dirname, "public", "src", "HR attachment");
if (!fs.existsSync(hrAttachmentDir)) { fs.mkdirSync(hrAttachmentDir, { recursive: true }); console.log("✅ Created HR attachment/"); }

const transferAttachmentDir = path.join(__dirname, "public", "src", "Transfer attachment");
if (!fs.existsSync(transferAttachmentDir)) { fs.mkdirSync(transferAttachmentDir, { recursive: true }); console.log("✅ Created Transfer attachment/"); }

const excelDir = path.join(__dirname, "public", "exports");
if (!fs.existsSync(excelDir)) { fs.mkdirSync(excelDir, { recursive: true }); console.log("✅ Created exports/"); }

const EXCEL_PATH = path.join(excelDir, "employee_onboarding_db.xlsx");

// ── MULTER: ONBOARDING ────────────────────────────────────────────────
const onboardStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const onboardFileFilter = (req, file, cb) => {
  if (/jpg|jpeg|png|pdf|docx/.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
  cb(new Error("Only JPG, JPEG, PNG, PDF and DOCX files are allowed"));
};
const upload = multer({ storage: onboardStorage, fileFilter: onboardFileFilter, limits: { files: 11 } })
  .fields([{ name: "documents", maxCount: 10 }, { name: "profileImage", maxCount: 1 }]);

// ── MULTER: EXTENSION ─────────────────────────────────────────────────
const hrStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, hrAttachmentDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${path.basename(file.originalname, ext).replace(/\s+/g, "_")}${ext}`);
  },
});
const hrUpload = multer({
  storage: hrStorage,
  fileFilter: (req, file, cb) => /\.(jpg|jpeg|png|pdf|docx)$/i.test(path.extname(file.originalname)) ? cb(null, true) : cb(new Error("Invalid file type")),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
}).array("hrAttachments", 10);

// ── MULTER: TRANSFER ──────────────────────────────────────────────────
const transferStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, transferAttachmentDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${path.basename(file.originalname, ext).replace(/\s+/g, "_")}${ext}`);
  },
});
const transferUpload = multer({
  storage: transferStorage,
  fileFilter: (req, file, cb) => /\.(jpg|jpeg|png|pdf|docx)$/i.test(path.extname(file.originalname)) ? cb(null, true) : cb(new Error("Invalid file type")),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
}).array("attachments", 10);

// ── MYSQL ─────────────────────────────────────────────────────────────
const db = mysql.createPool({
  host: "localhost", user: "root", password: "Golu@2005",
  database: "employee_onboarding", waitForConnections: true, connectionLimit: 10,
});

(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL connected");

    // users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        username   VARCHAR(100) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        role       ENUM('admin','hr','manager','viewer') NOT NULL DEFAULT 'viewer',
        full_name  VARCHAR(150),
        email      VARCHAR(150),
        is_active  TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ users table ready");

    // Seed default admin if empty
    const [existing] = await db.query("SELECT id FROM users LIMIT 1");
    if (existing.length === 0) {
      const hashed = await bcrypt.hash("Admin@123", 10);
      await db.query(
        "INSERT INTO users (username, password, role, full_name) VALUES (?, ?, 'admin', 'System Admin')",
        ["admin", hashed]
      );
      console.log("✅ Default admin seeded  →  username: admin  |  password: Admin@123");
    }

    // transfer_requests table
    await db.query(`
      CREATE TABLE IF NOT EXISTS transfer_requests (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        employee_id         VARCHAR(50)  NOT NULL,
        employee_name       VARCHAR(150) NOT NULL,
        existing_division   VARCHAR(100),
        existing_department VARCHAR(100),
        existing_location   VARCHAR(100),
        existing_team       VARCHAR(100),
        existing_supervisor VARCHAR(150),
        new_division        VARCHAR(100) NOT NULL,
        new_department      VARCHAR(100) NOT NULL,
        new_location        VARCHAR(100) NOT NULL,
        new_team            VARCHAR(100) NOT NULL,
        new_supervisor      VARCHAR(150) NOT NULL,
        transfer_type       VARCHAR(100) NOT NULL,
        mode_of_transfer    VARCHAR(50)  NOT NULL,
        effective_date      DATE         NOT NULL,
        remarks             TEXT,
        attachments         TEXT,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ transfer_requests table ready");

  } catch (err) {
    console.error("❌ DB setup failed:", err.message);
  }
})();

// ── HELPERS ───────────────────────────────────────────────────────────
function hashFile(fp) { return crypto.createHash("md5").update(fs.readFileSync(fp)).digest("hex"); }
function isValidDate(s) { return !!s && !isNaN(new Date(s).getTime()); }

function dedupeFiles(files) {
  const seen = new Set(), unique = [];
  for (const f of files) {
    const h = hashFile(f.path);
    if (seen.has(h)) { fs.unlinkSync(f.path); } else { seen.add(h); unique.push(f); }
  }
  return unique;
}

// ── JWT MIDDLEWARE ────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid or expired token. Please log in again." });
    req.user = decoded;
    next();
  });
}

// ── EXCEL EXPORT ──────────────────────────────────────────────────────
async function exportDbToExcel() {
  try {
    const [onboardRows]  = await db.query("SELECT * FROM onboarding_requests ORDER BY id DESC");
    const [extRows]      = await db.query("SELECT * FROM extension_requests ORDER BY id DESC");
    const [transferRows] = await db.query("SELECT * FROM transfer_requests ORDER BY id DESC");

    const wb = XLSX.utils.book_new();
    const onboardWs  = XLSX.utils.json_to_sheet(onboardRows.length  ? onboardRows  : [{}]);
    const extWs      = XLSX.utils.json_to_sheet(extRows.length      ? extRows      : [{}]);
    const transferWs = XLSX.utils.json_to_sheet(transferRows.length ? transferRows : [{}]);

    transferWs["!cols"] = [
      {wch:6},{wch:12},{wch:20},{wch:18},{wch:20},{wch:16},{wch:16},{wch:20},
      {wch:18},{wch:20},{wch:16},{wch:16},{wch:20},{wch:22},{wch:16},{wch:14},{wch:30},{wch:40},{wch:20},
    ];

    XLSX.utils.book_append_sheet(wb, onboardWs,  "Onboarding Requests");
    XLSX.utils.book_append_sheet(wb, extWs,      "Extension Requests");
    XLSX.utils.book_append_sheet(wb, transferWs, "Transfer Requests");
    XLSX.writeFile(wb, EXCEL_PATH);
    console.log(`✅ Excel refreshed at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("❌ Excel export failed:", err.message);
  }
}

// ════════════════════════════════════════════════
//  PUBLIC ROUTES
// ════════════════════════════════════════════════

app.get("/", (req, res) => res.send("Backend running ✅"));

// ── LOGIN ─────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: "Username and password are required." });

    const [rows] = await db.query(
      "SELECT id, username, password, role, full_name, is_active FROM users WHERE username = ? LIMIT 1",
      [username.trim()]
    );
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid username or password." });

    const user = rows[0];
    if (!user.is_active)
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });

    // Support both bcrypt and plain-text (auto-upgrade plain-text)
    let match = false;
    if (user.password.startsWith("$2")) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = password === user.password;
      if (match) {
        const hashed = await bcrypt.hash(password, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, user.id]);
        console.log(`🔒 Upgraded plain password for: ${user.username}`);
      }
    }

    if (!match)
      return res.status(401).json({ success: false, message: "Invalid username or password." });

    const payload = { id: user.id, username: user.username, role: user.role, full_name: user.full_name };
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    console.log(`✅ Login: ${user.username} (${user.role})`);
    res.json({ success: true, message: "Login successful.", token, user: payload });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── LOGOUT ────────────────────────────────────────────────────────────
app.post("/logout", authenticateToken, (req, res) => {
  console.log(`👋 Logout: ${req.user.username}`);
  res.json({ success: true, message: "Logged out successfully." });
});

// ── VERIFY TOKEN (called on page refresh) ─────────────────────────────
app.get("/verify-token", authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ════════════════════════════════════════════════
//  PROTECTED ROUTES
// ════════════════════════════════════════════════

app.get("/check-login/:loginId", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id FROM onboarding_requests WHERE login_id = ? LIMIT 1", [req.params.loginId]);
    res.json({ exists: rows.length > 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/export/excel", authenticateToken, async (req, res) => {
  await exportDbToExcel();
  if (!fs.existsSync(EXCEL_PATH)) return res.status(500).json({ success: false, message: "Excel generation failed." });
  res.download(EXCEL_PATH, "employee_onboarding_db.xlsx");
});
app.use("/exports", express.static(excelDir));

// ── ONBOARDING SUBMIT ─────────────────────────────────────────────────
app.post("/submit", authenticateToken, (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const data = req.body;
      const uniqueDocs = dedupeFiles(req.files["documents"] || []);
      const profileFiles = req.files["profileImage"] || [];
      const profileImage = profileFiles[0]?.filename || null;
      const documentNames = uniqueDocs.map(f => f.filename).join(",");

      const [dup] = await db.query(
        "SELECT id FROM onboarding_requests WHERE login_id=? AND date_of_joining=? LIMIT 1",
        [data.loginId, data.dateOfJoining]
      );
      if (dup.length > 0) {
        [...uniqueDocs, ...profileFiles].forEach(f => { try { fs.unlinkSync(f.path); } catch (_) {} });
        return res.status(409).json({ success: false, message: `Login ID "${data.loginId}" with this joining date already exists.` });
      }

      const [result] = await db.query(
        `INSERT INTO onboarding_requests (
          division,joining_type,type,subtype,login_id,position_type,supervisor_name,
          first_name,middle_name,last_name,user_contact,date_of_joining,
          location,team,grade,access_type,validity_date,additional_info,access_mode,
          access_cart,profile_image,document_name
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          data.division||null,data.joiningType||null,data.type||null,data.subtype||null,data.loginId||null,
          data.position||null,data.supervisorName||null,data.firstName||null,data.middleName||null,data.lastName||null,
          data.userContact||null,data.dateOfJoining||null,data.location||null,data.team||null,data.grade||null,
          data.accessType||null,data.validityDate||null,data.additionalInfo||null,data.accessMode||null,
          data.accessCart||null,profileImage,documentNames||null,
        ]
      );
      exportDbToExcel().catch(() => {});
      res.json({ success: true, message: "Data saved successfully", id: result.insertId });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });
});

// ── EXTENSION SUBMIT ──────────────────────────────────────────────────
app.post("/submit-extension", authenticateToken, (req, res) => {
  hrUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const { employeeId, employeeName, newValidity, addInfo } = req.body;
      if (!employeeId?.trim()) return res.status(400).json({ success: false, message: "Employee ID is required." });
      if (!employeeName?.trim()) return res.status(400).json({ success: false, message: "Employee name is required." });
      if (!newValidity?.trim() || !isValidDate(newValidity)) return res.status(400).json({ success: false, message: "Valid validity date is required." });

      const today = new Date(); today.setHours(0,0,0,0);
      if (new Date(newValidity) < today) {
        (req.files||[]).forEach(f => { try { fs.unlinkSync(f.path); } catch(_) {} });
        return res.status(400).json({ success: false, message: "Validity date cannot be in the past." });
      }

      const uniqueFiles = dedupeFiles(req.files || []);
      const [dup] = await db.query(
        "SELECT id FROM extension_requests WHERE employee_id=? AND extended_validity_date=? LIMIT 1",
        [employeeId.trim(), newValidity]
      );
      if (dup.length > 0) {
        uniqueFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch(_) {} });
        return res.status(409).json({ success: false, message: "Extension with this date already exists." });
      }

      const [result] = await db.query(
        `INSERT INTO extension_requests (employee_id,employee_name,extension,extended_validity_date,additional_info,hr_attachments)
         VALUES (?,?,'Yes',?,?,?)`,
        [employeeId.trim(), employeeName.trim(), newValidity, addInfo?.trim()||null, uniqueFiles.map(f=>f.filename).join(",")||null]
      );
      await db.query(
        `UPDATE onboarding_requests SET validity_date=?,extension='Yes',extended_validity_date=? WHERE login_id=?`,
        [newValidity, newValidity, employeeId.trim()]
      );
      exportDbToExcel().catch(() => {});
      res.json({ success: true, message: "Extension submitted.", id: result.insertId });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });
});

// ── TRANSFER SUBMIT ───────────────────────────────────────────────────
app.post("/submit-transfer", authenticateToken, (req, res) => {
  transferUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const {
        employeeId, employeeName,
        existingDivision, existingDepartment, existingLocation, existingTeam, existingSupervisor,
        newDivision, newDept, newLocation, newTeam, newSupervisor,
        transferType, mode, effectiveDate, remarks,
      } = req.body;

      const required = { employeeId, employeeName, newDivision, newDept, newLocation, newTeam, newSupervisor, transferType, mode, effectiveDate };
      for (const [field, val] of Object.entries(required)) {
        if (!val?.trim()) {
          (req.files||[]).forEach(f => { try { fs.unlinkSync(f.path); } catch(_) {} });
          return res.status(400).json({ success: false, message: `${field} is required.` });
        }
      }
      if (!isValidDate(effectiveDate)) return res.status(400).json({ success: false, message: "Invalid effective date." });
      if (!(req.files||[]).length) return res.status(400).json({ success: false, message: "At least one attachment is required." });

      const uniqueFiles = dedupeFiles(req.files);
      const [dup] = await db.query(
        "SELECT id FROM transfer_requests WHERE employee_id=? AND effective_date=? LIMIT 1",
        [employeeId.trim(), effectiveDate]
      );
      if (dup.length > 0) {
        uniqueFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch(_) {} });
        return res.status(409).json({ success: false, message: "Transfer for this employee on this date already exists." });
      }

      const [result] = await db.query(
        `INSERT INTO transfer_requests (
          employee_id,employee_name,
          existing_division,existing_department,existing_location,existing_team,existing_supervisor,
          new_division,new_department,new_location,new_team,new_supervisor,
          transfer_type,mode_of_transfer,effective_date,remarks,attachments
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          employeeId.trim(), employeeName.trim(),
          existingDivision||null, existingDepartment||null, existingLocation||null, existingTeam||null, existingSupervisor||null,
          newDivision.trim(), newDept.trim(), newLocation.trim(), newTeam.trim(), newSupervisor.trim(),
          transferType.trim(), mode.trim(), effectiveDate, remarks?.trim()||null,
          uniqueFiles.map(f=>f.filename).join(","),
        ]
      );
      exportDbToExcel().catch(() => {});
      res.json({ success: true, message: "Transfer request submitted.", id: result.insertId });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });
});

// ── EXCEL REFRESH ─────────────────────────────────────────────────────
app.get("/refresh-excel", authenticateToken, async (req, res) => {
  await exportDbToExcel();
  res.json({ success: true, message: "Excel refreshed.", timestamp: new Date().toISOString() });
});

// ── START ─────────────────────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server at http://localhost:${PORT}`);
  await exportDbToExcel();
});
