import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionType } from './transaction-type.enum';
import { Household } from './household';

@Entity()
export class Category {
    @PrimaryColumn()
    id: string;

    @Column()
    householdId: string;

    @ManyToOne(() => Household, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'householdId' })
    household: Household;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: TransactionType
    })
    type: TransactionType;

    @Column()
    color: string; // hex color code

    @Column()
    icon: string;
}
