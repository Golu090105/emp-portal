const bcrypt = require("bcryptjs");

async function main() {
  const hash = await bcrypt.hash("Admin@123", 10);
  console.log("Run this SQL:");
  console.log(`UPDATE users SET password = '${hash}' WHERE username = 'admin';`);
}

main();