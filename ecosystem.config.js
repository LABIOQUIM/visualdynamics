module.exports = {
  apps: [
    {
      name: "server",
      script: "poetry run flask run --host=0.0.0.0 --port=3002",
      cwd: "./apps/server",
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }]
};