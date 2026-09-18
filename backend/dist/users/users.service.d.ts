import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema.js';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findAll(): Promise<User[]>;
}
