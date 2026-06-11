import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { mongooseConfig } from './mongoose.config';

@Module({
  imports: [MongooseModule.forRootAsync({ useFactory: mongooseConfig })],
})
export class DatabaseModule {}
