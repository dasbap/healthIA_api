import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScopesGuard } from '../auth/scopes.guard';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, ScopesGuard],
  exports: [UsersService],
})
export class UsersModule {}
