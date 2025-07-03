import { RecurrentTransactionType } from "shared/dist/entities/recurrent-transaction-type.enum";
import { IRecurrentTransaction } from "shared/dist/entities/recurrent-transaction.interface";

export interface BaseRecurrence extends Partial<IRecurrentTransaction> {
  type: RecurrentTransactionType;
  startDate: Date;
  endDate?: Date;
}

export interface FixedBaseRecurrence extends BaseRecurrence {
    shiftToValidDate: boolean;
}
