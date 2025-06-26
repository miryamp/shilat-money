import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Currency } from './currency.enum';

@Entity()
export class Household {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: Currency
    })
    currency: Currency;
}
