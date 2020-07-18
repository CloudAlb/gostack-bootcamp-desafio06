import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

import {
  getRepository,
  getCustomRepository,
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
    const categoryRepository = getRepository(Category); // notar na != do uso de getCustomRepository() e getRepository()

    // checando se o tipo é outcome e extrapola o saldo atual
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Requested outcome exceeds available value.', 400);
    }

    // checando se a categoria já existe (mesmo título)
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category, // se title de category === parâmetro category
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

    // notar como foi simplificado o caso de precisar ou não criar uma category...
    // se existir, blz
    // se não existir, cria e guarda usando a mesma variável, e depois usa essa mesma variável aqui
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
