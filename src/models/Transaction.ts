import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne, // cardinalidade
  JoinColumn, // join, ligação
} from 'typeorm';

import Category from '../models/Category'; // preciso informar o model da tabela referenciada para fazer um join

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('decimal')
  value: number;

  @ManyToOne(() => Category) // é N -> 1 em relação a tabela Category
  @JoinColumn({ name: 'category_id' }) // qual coluna de transactions deverá referenciar
  category: Category;

  @Column()
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;
