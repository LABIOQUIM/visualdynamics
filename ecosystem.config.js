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
      env: {
        ENV: 'development'
      },
      env_production : {
        ENV: 'production'
      }
    },
    {
    name: 'nextjs-client',
    script: 'pnpm',
    args: "start",
    cwd: "$HOME/visualdynamics2/apps/client",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      APP_URL: "",
      NEXT_PUBLIC_BACKEND_URL: '',
      NEXTAUTH_URL: "",
      NEXTAUTH_SECRET: "",
      EMAIL_NO_REPLY: "",
      EMAIL_PASS: ""
    }
  }]
};