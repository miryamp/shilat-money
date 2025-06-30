import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Currency } from 'shared/dist/entities/currency.enum';
import { IHousehold } from 'shared/dist/entities/household.interface';

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
