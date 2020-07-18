import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

import {
  getRepository,
  getCustomRepository,
  TransactionRepository,
} from 'typeorm'; // eu mesmo que importei

// criei uma interface para padronizar os dados recebidos
interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    // pegando o repositório existente, que vai conter todos os métodos necessários
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    // checando se o tipo é outcome e extrapola o saldo atual
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Requested outcome exceeds available value.', 400);
    }

    // checando se a categoria já existe (mesmo título)
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    // se não existir...
    if (!transactionCategory) {
      // criar novo registro para a categoria
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
