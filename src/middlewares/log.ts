import { Request, Response, NextFunction, RequestHandler } from 'express';
import { log } from '../utils/log';

function logMiddleware(req: Request, _res: Response, next: NextFunction): void {
  log(`${req.method} ${req.originalUrl}`);
  console.log(req.body)

  next();
}

export function createLogMiddleware(): RequestHandler {
  return logMiddleware;
}
