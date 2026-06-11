export const env = {
  apiPort: Number(process.env.API_PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://root:change-me-dev-password@localhost:27017/healthia?authSource=admin',
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-placeholder',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8001',
  aiServiceToken: process.env.AI_SERVICE_TOKEN,
};
