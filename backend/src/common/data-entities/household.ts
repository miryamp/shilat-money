import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Currency } from './currency.enum';

@Entity()
export class Household {
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
