import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionType } from 'shared/dist/entities/transaction-type.enum';
import { Household } from './household';
import { ICategory } from 'shared/dist/entities/category.interface'

@Entity()
export class Category implements ICategory {
    @PrimaryGeneratedColumn('uuid')
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

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: true, default: null })
    fatherId?: string;

    @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'fatherId' })
    father?: Category;
}
