import { User } from '../common/data-entities/user';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(user: Partial<User>): Promise<User>;
    update(id: string, user: Partial<User>): Promise<User | null>;
}
