// import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

// perceber como está simplificado a questão de informações recebidas
// como era apenas uma informação, não era necessário:
// 1. interface
// 2. desestruturação
class DeleteTransactionService {
  public async execute(id: string): Promise<void> { // pelos requisitos, se encaixa como método com retorno void
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      // se não existir
      throw new AppError('Transaction does not exist');
    }

    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
