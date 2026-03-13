/** PM2: frontend production build – 80 port (http://IP/) */
const path = require("path");
module.exports = {
  apps: [
    {
      name: "BOOKON-REACT",
      script: path.join(__dirname, "node_modules", "serve", "build", "main.js"),
      args: "-s build -l 80",
      cwd: __dirname,
      interpreter: "node",
      env: { NODE_ENV: "production" },
    },
  ],
};
