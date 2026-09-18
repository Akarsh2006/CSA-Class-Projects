import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthResolver } from './auth.resolver.js';

@Module({
  providers: [AuthService, AuthResolver]
})
export class AuthModule {}
