module.exports = {
  apps: [
    {
      name: "server",
      script: "poetry run flask run --host=0.0.0.0",
      cwd: "./apps/server",
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
    name: 'client',
    script: 'pnpm',
    args: "start",
    cwd: "./apps/client",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};