import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddCategoryIdToTransactions1594856250409
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // "apenas criando a ligação entre as tabelas, onde as chaves já estão criadas" (?)
    await queryRunner.createForeignKey(
      'transactions', // onde a chave estrangeira será criada
      new TableForeignKey({
        columnNames: ['category_id'], // nome da coluna contida na tabela onde a chave estrangeira será criada
        referencedColumnNames: ['id'], // nome da coluna referenciada
        referencedTableName: 'categories', // tabela contendo a coluna referenciada
        name: 'TransactionCategory', // apelido, nome da chave estrangeira
        onUpdate: 'CASCADE', // se atualizar, todas as referências existentes serão atualizadas também
        onDelete: 'SET NULL', // se deletar, suas referências existentes serão settadas como nulas
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
    await queryRunner.dropColumn('transactions', 'category_id');
  }
}
