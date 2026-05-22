/** PM2: frontend production build – 3005 (80 uchun serverda nginx proxy qiling) */
const path = require("path");
module.exports = {
  apps: [
    {
      name: "BOOKON-REACT",
      script: path.join(__dirname, "node_modules", "serve", "build", "main.js"),
      args: "-s build -l tcp://0.0.0.0:3005",
      cwd: __dirname,
      interpreter: "node",
      env: { NODE_ENV: "production" },
    },
  ],
};
