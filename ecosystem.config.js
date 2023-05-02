module.exports = {
  apps: [
    {
      name: "flask-api",
      script: "poetry",
      args: "run flask run",
      cwd: "$HOME/visualdynamics2/apps/server",
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      interpreter: "/bin/bash",
    },
    {
    name: 'nextjs-client',
    script: 'pnpm',
    args: "start",
    cwd: "$HOME/visualdynamics2/apps/client",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    interpreter: "/bin/bash",
  }]
};