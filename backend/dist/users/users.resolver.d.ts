import { User } from './user.schema.js';
import { UsersService } from './users.service.js';
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<User[]>;
}
