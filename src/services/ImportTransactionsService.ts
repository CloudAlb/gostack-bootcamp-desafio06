import { getCustomRepository, getRepository, In } from 'typeorm';

import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const contactsReadStream = fs.createReadStream(filePath);

    // configurando a instância do csvParse
    const parsers = csvParse({
      // delimiter: ',',
      from_line: 2,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    // boot insert -> guardo todas as informações lidas em variáveis
    // e só insiro no BD depois, para abrir só uma vez a conexão com o BD
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) {
        return;
      }

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    // se eu inserisse um console.log(categories) aqui, ele iria mostrar vazio
    // porque essa inserção do vetor ia acontecer "em segundo plano"
    // por isso crio essa nova promise, onde o restante do código só vai ser executado
    // se o parseCSV mostrar seu processo como 'end', ou seja, terminado
    // aí as informações serão mostradas corretamente
    // parece que essa função chama ela mesma até que o 'end' seja disparado
    // ela resolve algo, por isso 'resolve' ?
    await new Promise(resolve => parseCSV.on('end', resolve));

    // regras de negócio para verificar e criar categorias novas se necessário
    // não se usa a CreateTransactionService pois ela envia 1 por 1, e abriria conexões desnecessárias com o BD

    // esse método verifica de uma vez se existe categorias das contidas no array categories
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    // pegando somente o título da categoria, que é o importante
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    // varrendo o vetor de categories inseridas procurando as categorias que não
    // estão incluídas no BD; e filtrando as repetições
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    // cria várias instâncias de objetos de categorias para serem criadas (salvas)
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    // salvando no BD
    await categoriesRepository.save(newCategories);

    // usando spread operator para juntar as categorias novas com as existentes para retornar
    const finalCategories = [...newCategories, ...existentCategories];

    // criando as transações, de forma semelhante ao que foi feito com as novas categorias
    const createdTransactions = transactionsRepository.create(
      // instanciando
      transactions.map(transaction => ({
        // mapeando (passando por cada elemento do vetor) onde cada transação do vetor de transações recebe o nome de 'transaction'
        title: transaction.title, // criando vários objetos para serem instanciados pelo create de uma vez só
        type: transaction.type, // cada objeto terá as informações assim
        value: transaction.value, // e assim
        category: finalCategories.find(
          // e a categoria será buscada pelo vetor de todas as categorias, onde o nome da categoria da transação for igual ao nome do title da category do vetor de categories
          category => category.title === transaction.category,
        ),
      })),
    );

    // salvando as transações no BD
    await transactionsRepository.save(createdTransactions);

    // deletando o arquivo CSV
    // lembrando que .promises. torna a função uma promise, ou seja, ela será executada (?)
    await fs.promises.unlink(filePath);

    // retornando as transações criadas
    return createdTransactions;
  }
}

export default ImportTransactionsService;
