// é um custom repository...
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

// interface para padronizar o recebimento de informações
interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction) // decorator
class TransactionsRepository extends Repository<Transaction> { // um custom repository extends de um repository?
  public async getBalance(): Promise<Balance> { // criei um custom repository só pelo método customizado... se não, não precisaria de um custom repository
    const transactions = await this.find(); // this -> isto, no caso, o repositório TypeORM

    const { income, outcome } = transactions.reduce(
      (accumulator, transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += Number(transaction.value);
            break;
          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;
          default:
            break;
        }
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
