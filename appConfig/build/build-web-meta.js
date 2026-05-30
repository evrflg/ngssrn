const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "../..", "dist", "index.html");

if (!fs.existsSync(target)) {
  console.error("未找到 dist/index.html，请先执行 web 打包");
  process.exit(1);
}

let html = fs.readFileSync(target, "utf8");

const metas = [
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black" />',
];

const missing = metas.filter((m) => !html.includes(m));
if (missing.length === 0) {
  console.log("meta 已存在，跳过注入");
  process.exit(0);
}

html = html.replace("</head>", `  ${missing.join("\n  ")}\n</head>`);
fs.writeFileSync(target, html, "utf8");
console.log("已注入 web meta 到 dist/index.html");
