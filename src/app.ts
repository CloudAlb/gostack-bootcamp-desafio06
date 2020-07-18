import 'reflect-metadata'; // requisito do TypeORM
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express'; // necessário para tipar os parâmetros de app.use(), aqui isso é necessário, mas não sei o por quê
import 'express-async-errors'; // necessário, pois o express, por si só, não consegue capturar os erros lançados durante operações async

import routes from './routes';
import AppError from './errors/AppError';

import createConnection from './database';

createConnection();
const app = express();

app.use(express.json());
app.use(routes);

// isso captura erros globalmente lançados de AppError
app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // se não foi lançado de AppError, é algo interno do server
  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
