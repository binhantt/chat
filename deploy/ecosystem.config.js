// PM2 Ecosystem — backend + frontend
// Run: pm2 start deploy/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'chat-backend',
      cwd: '/home/chat/backend',
      script: 'node',
      args: 'dist/src/main',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/home/chat/logs/backend-error.log',
      out_file: '/home/chat/logs/backend-out.log',
      merge_logs: true,
    },
    {
      name: 'chat-frontend',
      cwd: '/home/chat/Frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/home/chat/logs/frontend-error.log',
      out_file: '/home/chat/logs/frontend-out.log',
      merge_logs: true,
    },
  ],
};
