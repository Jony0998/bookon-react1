/** PM2: frontend production build – 3000 (backend 3005 bilan to'qnashmasin) */
const path = require("path");
module.exports = {
  apps: [
    {
      name: "BOOKON-REACT",
      script: path.join(__dirname, "node_modules", "serve", "build", "main.js"),
      args: "-s build -l tcp://0.0.0.0:3000",
      cwd: __dirname,
      interpreter: "node",
      env: { NODE_ENV: "production" },
    },
  ],
};
