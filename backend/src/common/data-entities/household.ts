import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Currency } from 'shared/entities/currency.enum';
import { IHousehold } from 'shared/entities/household.interface';

@Entity()
export class Household implements IHousehold {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: Currency
    })
    currency: Currency;
}
