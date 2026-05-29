// ecosystem.config.cjs — إعداد PM2 لخدمة التطبيق الثابت محلياً (تطوير/اختبار)
module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'static-server.cjs',
      cwd: __dirname,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
