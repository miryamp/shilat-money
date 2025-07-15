import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';

export interface RecurrentTransactionRepository {
    create(entity: RecurrentTransaction): Promise<RecurrentTransaction>;
    findAll(householdId: string, options?: { isActive?: boolean }): Promise<RecurrentTransaction[]>;
    findOne(id: string, householdId: string): Promise<RecurrentTransaction | null>;
    update(id: string, update: Partial<RecurrentTransaction>, householdId: string): Promise<RecurrentTransaction | null>;
    remove(id: string, householdId: string): Promise<RecurrentTransaction | null>;
}
