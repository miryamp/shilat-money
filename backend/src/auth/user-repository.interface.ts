import { User } from '../common/data-entities/user';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
    findByEmail(email: string, tx?: any): Promise<User | null>;
    findOne(id: string, tx?: any): Promise<User | null>;
    findByHouseholdId(householdId: string, tx?: any): Promise<User[]>;
    create(user: Partial<User>, tx?: any): Promise<User>;
    update(id: string, user: Partial<User>, tx?: any): Promise<User | null>;
}
