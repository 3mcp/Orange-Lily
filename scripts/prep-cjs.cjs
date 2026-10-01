const fs = require("fs");
const path = require("path");

const destino = path.join(__dirname, "..", "dist-cjs", "package.json");
fs.writeFileSync(destino, JSON.stringify({ type: "commonjs" }, null, 2));
console.log("dist-cjs marcado como CommonJS.");
