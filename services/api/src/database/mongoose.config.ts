import { MongooseModuleOptions } from '@nestjs/mongoose';

import { env } from '../config/env.config';

export function mongooseConfig(): MongooseModuleOptions {
  return {
    uri: env.mongoUri,
    serverSelectionTimeoutMS: 1200,
  };
}
