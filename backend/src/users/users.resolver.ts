import { Resolver, Query } from '@nestjs/graphql';
import { User } from './user.schema.js';
import { UsersService } from './users.service.js';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async getUsers() {
    return this.usersService.findAll();
  }
}
