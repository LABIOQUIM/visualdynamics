module.exports = {
  apps: [
    {
      name: "flask-api",
      script: "poetry",
      args: "run flask run",
      cwd:"~/visualdynamics2/apps/server",
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
    name: 'nextjs-client',
    script: 'pnpm',
    args:"start",
    cwd:"~/visualdynamics2/apps/client",
    instances: 2,
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