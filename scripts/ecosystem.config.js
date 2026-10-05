module.exports = {
  apps: [
    {
      name: "cloudtask-backend",
      script: "./src/server.js",
      cwd: "./backend",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M"
    }
  ]
};