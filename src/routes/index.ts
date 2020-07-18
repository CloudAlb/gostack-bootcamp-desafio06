// início de tudo
import { Router } from 'express';

import transactionsRouter from './transactions.routes';

const routes = Router();

// especificando url necessária para todas as routes de transactionsRouter
routes.use('/transactions', transactionsRouter);

export default routes;
