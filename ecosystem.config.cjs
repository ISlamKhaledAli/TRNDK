module.exports = {
  apps: [
    {
      name: "website-api",
      script: "dist/index.cjs",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        JWT_SECRET: "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET",
        // RECOVERY_SECRET: "CHANGE_THIS_TOO_IF_REQUIRED",
        // DATABASE_URL: "YOUR_DB_URL_IF_REQUIRED"
      },
    },
  ],
};


