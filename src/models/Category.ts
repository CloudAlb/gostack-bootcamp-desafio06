import {
  Entity, // nome da tabela
  Column, // coluna
  PrimaryGeneratedColumn, // auto generated
  CreateDateColumn, // created_at, é automática
  UpdateDateColumn, // updated at, é automática
} from 'typeorm';

@Entity('categories') // decorator
class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Category;
