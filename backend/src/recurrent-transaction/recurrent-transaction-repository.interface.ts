import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';

export interface RecurrentTransactionRepository {
    create(entity: RecurrentTransaction, tx?: any): Promise<RecurrentTransaction>;
    findAll(householdId: string, options?: { 
        isActive?: boolean,
        startedBefore?: Date,
        endsAfter?: Date
    }, tx?: any): Promise<RecurrentTransaction[]>;
    findOne(id: string, householdId: string, tx?: any): Promise<RecurrentTransaction | null>;
    update(id: string, update: Partial<RecurrentTransaction>, householdId: string, tx?: any): Promise<RecurrentTransaction | null>;
    remove(id: string, householdId: string, tx?: any): Promise<RecurrentTransaction | null>;
}
