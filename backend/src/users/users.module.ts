import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service.js';
import { UsersResolver } from './users.resolver.js';
import { User, UserSchema } from './user.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, UsersResolver],
  exports: [UsersService]
})
export class UsersModule {}
