import { Router } from 'express';

import multer from 'multer';

import { getCustomRepository } from 'typeorm'; // eu mesmo que importei

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload'; // importando arquivo de configurações para usar com o multer

const upload = multer(uploadConfig); // instanciando com o arquivo de configs do multer que criei

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository); // não preciso do model Transaction para importar, senão seria getRepository()
  const transactions = await transactionsRepository.find(); // pegando todas as transações
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  response.status(204).send();
});

// prestar atenção no middleware usado aqui, no caso, o multer
transactionsRouter.post('/import',
upload.single('file'),
async (request, response) => {
  const importTransactions = new ImportTransactionsService();

  const transactions = await importTransactions.execute(request.file.path); // passando o caminho como parâmetro

  return response.json(transactions);
});

export default transactionsRouter;
