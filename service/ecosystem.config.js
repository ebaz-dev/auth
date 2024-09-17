const { PORTS, ENVS } = require('@ebazdev/core');

module.exports = {
  apps: [
    {
      name: "auth",
      script: "./build/index.js",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "local",
        PORT: PORTS.DEV.Auth,
        NATS_CLIENT_ID:'auth-service',
        ...ENVS.DEV
      },
      env_development: {
        NODE_ENV: "development",
        PORT: PORTS.DEV.Auth,
        NATS_CLIENT_ID:'auth-service',
        ...ENVS.DEV
      },
      env_stag: {
        NODE_ENV: "stag",
        PORT: PORTS.STAG.Auth,
        NATS_CLIENT_ID:'auth-service',
        ...ENVS.STAG
      },
      env_production: {
        NODE_ENV: "production",
        PORT: PORTS.DEV.Auth,
        NATS_CLIENT_ID:'auth-service',
        ...ENVS.PROD
      },
    },
  ],
};
